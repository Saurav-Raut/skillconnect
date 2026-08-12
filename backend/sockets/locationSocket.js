const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const ChatMessage = require('../models/ChatMessage');
const { findNearbyAvailableWorkers, selectNextRoundWorkers } = require('../utils/geoMatch');

// In-memory active broadcast manager for LiveMatch live matching
const activeBroadcasts = new Map();
// Rate-limiting map for location updates (key -> timestamp)
const lastLocationUpdates = new Map();
// Grace period disconnect timeouts (key: workerId -> timeoutId)
const disconnectTimeouts = new Map();

const RATE_LIMIT_INTERVAL_MS = 3000; // max once per 3 seconds

module.exports = (io) => {
  // Save socket.io globally for notification helpers
  global.io = io;

  /**
   * Helper: execute broadcast for a specific round
   */
  const broadcastRoundToWorkers = async (bookingId, round) => {
    const broadcast = activeBroadcasts.get(bookingId.toString());
    if (!broadcast || broadcast.status !== 'searching') return;

    try {
      // Find all available workers matching skill within radius
      const allNearby = await findNearbyAvailableWorkers({
        skill: broadcast.skillRequested,
        coordinates: broadcast.householdLocation,
        maxDistanceKm: broadcast.radiusKm,
        excludedWorkerIds: Array.from(broadcast.notifiedWorkerIds),
        limit: 15
      });

      const nextWorkers = selectNextRoundWorkers(allNearby, Array.from(broadcast.notifiedWorkerIds), 5);

      if (nextWorkers.length === 0) {
        // No more available workers to notify
        if (broadcast.timer) clearTimeout(broadcast.timer);
        broadcast.status = 'failed';
        io.to(`booking_${bookingId}`).emit('liveMatchMatchFailed', {
          bookingId,
          reason: 'NO_WORKERS_AVAILABLE',
          message: `No available ${broadcast.skillRequested || 'workers'} accepted after ${round} round(s). Please retry or widen radius.`
        });
        await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled', cancelledBy: 'none' });
        activeBroadcasts.delete(bookingId.toString());
        return;
      }

      const currentRoundWorkerIds = [];
      nextWorkers.forEach((w) => {
        const wid = w._id.toString();
        broadcast.notifiedWorkerIds.add(wid);
        currentRoundWorkerIds.push(wid);

        // Emit incoming request card to this worker
        io.emit('incomingLiveMatchRequest', {
          bookingId: broadcast.bookingId,
          skill: broadcast.skillRequested,
          householdName: broadcast.householdName || 'Household Customer',
          distanceKm: w.distanceKm || 1.2,
          approximateAddress: broadcast.householdAddressText || 'Thullur, Amaravati, AP',
          ratePerHour: broadcast.ratePerHour || 150,
          totalAmount: broadcast.totalAmount || 300,
          countdownSeconds: 30,
          round,
          workerId: wid
        });
      });

      broadcast.currentRoundWorkerIds = currentRoundWorkerIds;
      broadcast.round = round;

      // Update Booking in DB with latest round & notified list
      await Booking.findByIdAndUpdate(bookingId, {
        broadcastRound: round,
        notifiedWorkers: Array.from(broadcast.notifiedWorkerIds)
      });

      // Emit round progress to Household room
      io.to(`booking_${bookingId}`).emit('liveMatchRoundProgress', {
        bookingId,
        round,
        maxRounds: 3,
        workersContacted: currentRoundWorkerIds.length,
        totalNotified: broadcast.notifiedWorkerIds.size
      });

      // Start 30-second timer for this round
      if (broadcast.timer) clearTimeout(broadcast.timer);
      broadcast.timer = setTimeout(async () => {
        const b = activeBroadcasts.get(bookingId.toString());
        if (b && b.status === 'searching') {
          if (b.round < 3) {
            console.log(`[Live Match] Round ${b.round} timed out for booking ${bookingId}. Moving to Round ${b.round + 1}`);
            await broadcastRoundToWorkers(bookingId, b.round + 1);
          } else {
            console.log(`[Live Match] All 3 rounds expired for booking ${bookingId}`);
            b.status = 'failed';
            io.to(`booking_${bookingId}`).emit('liveMatchMatchFailed', {
              bookingId,
              reason: 'TIMEOUT_ALL_ROUNDS',
              message: `No available ${b.skillRequested || 'workers'} accepted after 3 rounds. You can retry with a wider radius (e.g. 10km).`
            });
            await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled', cancelledBy: 'none' });
            activeBroadcasts.delete(bookingId.toString());
          }
        }
      }, 30000);
    } catch (err) {
      console.error('[Live Match] Broadcast Error:', err.message);
    }
  };

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join room for specific booking tracking
    socket.on('joinBooking', ({ bookingId, userId }) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${userId} joined room for booking_${bookingId}`);
    });

    // Handle explicit worker online/offline toggles and socket tagging
    socket.on('workerOnlineToggle', async ({ workerId, isOnline }) => {
      try {
        if (!workerId) return;
        socket.workerId = workerId; // Tag socket for disconnect tracking

        if (isOnline) {
          // Clear any pending disconnect timeout (silent reconnect success)
          const pending = disconnectTimeouts.get(workerId);
          if (pending) {
            clearTimeout(pending);
            disconnectTimeouts.delete(workerId);
          }
        }
        
        await Worker.findByIdAndUpdate(workerId, { isOnline });
        console.log(`Worker ${workerId} isOnline set to ${isOnline}`);
      } catch (err) {
        console.error('Toggle Error:', err.message);
      }
    });

    // Cross-Platform alias handlers for Web + Mobile real-time sync
    socket.on('join_booking_room', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    socket.on('join_location_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('location_update', (data) => {
      if (data && data.roomId) {
        io.to(data.roomId).emit('worker_location_update', data);
      }
    });

    socket.on('booking_status_change', (data) => {
      if (data && data.bookingId) {
        io.to(`booking_${data.bookingId}`).emit('booking_status_updated', data);
      }
    });


    // Rate-limited two-way location streaming (max once per 3-5 seconds per user/worker)
    socket.on('updateLocation', async ({ workerId, bookingId, coordinates, role = 'worker' }) => {
      if (!coordinates || coordinates.length !== 2) return;

      const now = Date.now();
      const throttleKey = workerId || socket.id;
      const lastTime = lastLocationUpdates.get(throttleKey) || 0;

      // Rate limiting: discard if less than 3 seconds since last update
      if (now - lastTime < RATE_LIMIT_INTERVAL_MS) {
        return;
      }
      lastLocationUpdates.set(throttleKey, now);

      const [lng, lat] = coordinates;
      console.log(`[Socket] ${role} location update: [${lng}, ${lat}] for booking ${bookingId}`);

      try {
        // Update Worker coordinates in database if sender is worker
        if (workerId && role === 'worker') {
          await Worker.findOneAndUpdate(
            { _id: workerId },
            {
              location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              currentLocation: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              }
            }
          );
        }

        // Broadcast rate-limited coordinate update to the specific booking tracking room
        io.to(`booking_${bookingId}`).emit('locationChanged', {
          workerId,
          role,
          coordinates: [parseFloat(lng), parseFloat(lat)],
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Socket location update error:', err.message);
      }
    });

    // Alias for two-way LiveMatch location streaming
    socket.on('streamLiveMatchLocation', (data) => {
      socket.emit('updateLocation', data);
    });

    // ==========================================
    // RAPIDO LIVE MATCHING SOCKET HANDLERS
    // ==========================================

    /**
     * Step 1-4: Household starts a LiveMatch Live Match broadcast
     */
    socket.on('startLiveMatchMatch', async ({
      bookingId,
      skill,
      coordinates,
      addressText,
      radiusKm = 5,
      householdName,
      ratePerHour,
      totalAmount
    }) => {
      if (!bookingId || !coordinates || coordinates.length !== 2) return;

      console.log(`[Live Match] Starting broadcast for booking ${bookingId} (${skill}) within ${radiusKm}km`);

      socket.join(`booking_${bookingId}`);

      activeBroadcasts.set(bookingId.toString(), {
        bookingId,
        skillRequested: skill,
        householdLocation: coordinates,
        householdAddressText: addressText || 'Thullur, Amaravati, AP',
        householdName: householdName || 'Household Customer',
        radiusKm: parseFloat(radiusKm) || 5,
        ratePerHour: parseFloat(ratePerHour) || 150,
        totalAmount: parseFloat(totalAmount) || 300,
        round: 1,
        notifiedWorkerIds: new Set(),
        currentRoundWorkerIds: [],
        status: 'searching',
        timer: null
      });

      await broadcastRoundToWorkers(bookingId, 1);
    });

    /**
     * Step 5: Worker accepts LiveMatch job (First to accept wins!)
     */
    socket.on('acceptLiveMatchJob', async ({ bookingId, workerId }) => {
      if (!bookingId || !workerId) return;
      const bKey = bookingId.toString();
      const broadcast = activeBroadcasts.get(bKey);

      // Atomic race resolution check
      if (!broadcast || broadcast.status !== 'searching') {
        // Another worker already took it or broadcast ended
        socket.emit('liveMatchJobAlreadyTaken', {
          bookingId,
          reason: 'ALREADY_ACCEPTED',
          message: 'Job already taken by another nearby worker.'
        });
        return;
      }

      // We have a winner!
      broadcast.status = 'accepted';
      if (broadcast.timer) clearTimeout(broadcast.timer);

      try {
        const workerDoc = await Worker.findById(workerId).populate('user', '-password');
        if (!workerDoc) return;

        // Set worker as unavailable & assign to booking
        await Worker.findByIdAndUpdate(workerId, { isAvailable: false });
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            worker: workerId,
            status: 'accepted',
            escrowStatus: 'held',
            chatChannelId: `chat_${bookingId}`,
            callSessionId: `call_${bookingId}`
          },
          { new: true }
        ).populate({ path: 'household', populate: { path: 'user', select: '-password' } });

        // Notify all other workers who received the broadcast that the job is already taken
        broadcast.notifiedWorkerIds.forEach((id) => {
          if (id !== workerId.toString()) {
            io.emit('liveMatchJobAlreadyTaken', {
              bookingId,
              winnerWorkerId: workerId,
              message: 'Job Already Taken by another nearby worker'
            });
          }
        });

        // Notify Household room that a worker won and is en route!
        io.to(`booking_${bookingId}`).emit('liveMatchMatchFound', {
          bookingId,
          worker: workerDoc,
          booking: updatedBooking,
          chatChannelId: `chat_${bookingId}`,
          callSessionId: `call_${bookingId}`
        });

        // Notify the winning worker socket
        socket.emit('liveMatchJobWinSuccess', {
          bookingId,
          worker: workerDoc,
          booking: updatedBooking
        });

        // Clean up memory after winning
        activeBroadcasts.delete(bKey);
      } catch (err) {
        console.error('[LiveMatch Accept Error]:', err.message);
      }
    });

    /**
     * Step 6: Worker rejects LiveMatch job -> trigger next round if current round empty
     */
    socket.on('rejectLiveMatchJob', async ({ bookingId, workerId }) => {
      if (!bookingId || !workerId) return;
      const bKey = bookingId.toString();
      const broadcast = activeBroadcasts.get(bKey);
      if (!broadcast || broadcast.status !== 'searching') return;

      broadcast.currentRoundWorkerIds = broadcast.currentRoundWorkerIds.filter(
        (id) => id !== workerId.toString()
      );

      // If all workers in current round rejected, immediately trigger next round
      if (broadcast.currentRoundWorkerIds.length === 0) {
        if (broadcast.timer) clearTimeout(broadcast.timer);
        if (broadcast.round < 3) {
          console.log(`[Live Match] All workers in Round ${broadcast.round} rejected. Proceeding to Round ${broadcast.round + 1}`);
          await broadcastRoundToWorkers(bookingId, broadcast.round + 1);
        } else {
          broadcast.status = 'failed';
          io.to(`booking_${bookingId}`).emit('liveMatchMatchFailed', {
            bookingId,
            reason: 'ALL_WORKERS_REJECTED',
            message: `No available ${broadcast.skillRequested || 'workers'} accepted after 3 rounds. Please retry or widen radius.`
          });
          await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled', cancelledBy: 'none' });
          activeBroadcasts.delete(bKey);
        }
      }
    });

    /**
     * Step 9: Cancel before job start -> reset worker availability back to pool
     */
    socket.on('cancelLiveMatchBooking', async ({ bookingId, cancelledBy = 'household', workerId }) => {
      if (!bookingId) return;
      console.log(`[Live Match] Booking ${bookingId} cancelled by ${cancelledBy}`);

      try {
        const bKey = bookingId.toString();
        const broadcast = activeBroadcasts.get(bKey);
        if (broadcast && broadcast.timer) clearTimeout(broadcast.timer);
        activeBroadcasts.delete(bKey);

        await Booking.findByIdAndUpdate(bookingId, {
          status: 'cancelled',
          cancelledBy
        });

        // Reset worker availability so they re-enter the pool immediately
        if (workerId) {
          await Worker.findByIdAndUpdate(workerId, { isAvailable: true });
        }

        io.to(`booking_${bookingId}`).emit('liveMatchBookingCancelled', {
          bookingId,
          cancelledBy,
          message: `Booking cancelled by ${cancelledBy}. Worker availability reset.`
        });
      } catch (err) {
        console.error('[LiveMatch Cancel Error]:', err.message);
      }
    });

    // ==========================================
    // PERSISTENT SCOPED CHAT RELAY
    // ==========================================
    socket.on('sendScopedMessage', async ({ bookingId, senderId, senderRole = 'household', message }) => {
      if (!bookingId || !senderId || !message) return;
      try {
        const chatMsg = await ChatMessage.create({
          booking: bookingId,
          sender: senderId,
          senderRole,
          message
        });

        // Broadcast to the booking room
        io.to(`booking_${bookingId}`).emit('scopedMessageReceived', {
          _id: chatMsg._id,
          booking: bookingId,
          sender: senderId,
          senderRole,
          message,
          createdAt: chatMsg.createdAt
        });
      } catch (err) {
        console.error('[Scoped Chat Error]:', err.message);
      }
    });

    // Handle SOS button trigger
    socket.on('triggerSOS', async ({ bookingId, userId, role, coordinates }) => {
      console.log(`[SOS ALERT] TRIGGERED BY USER ${userId} (${role}) on booking ${bookingId}`);
      
      try {
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, { sosTriggered: true });
        }

        io.to(`booking_${bookingId}`).emit('sosAlert', {
          bookingId,
          userId,
          role,
          coordinates,
          message: `🚨 EMERGENCY: SOS button pressed by ${role}! Immediate assistance needed.`,
          timestamp: new Date()
        });

        io.emit('adminSosNotification', {
          bookingId,
          userId,
          role,
          coordinates,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('SOS trigger error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
      if (socket.workerId) {
        const wid = socket.workerId;
        // Start 15-20s grace period before marking offline
        const timeout = setTimeout(async () => {
          try {
            await Worker.findByIdAndUpdate(wid, { isOnline: false });
            disconnectTimeouts.delete(wid);
            console.log(`Worker ${wid} marked offline after 15s grace period.`);
          } catch(err) {
            console.error('Disconnect Grace Error:', err.message);
          }
        }, 18000); // 18 seconds grace period
        disconnectTimeouts.set(wid, timeout);
      }
    });
  });
};
