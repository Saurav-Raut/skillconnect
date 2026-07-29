const Appeal = require('../models/Appeal');
const Worker = require('../models/Worker');
const { sendPushNotification } = require('../utils/notifications');

/**
 * Intercepts potential auto-deactivation triggers for a worker.
 * Instead of instantly disabling the worker's account, it creates a pending appeal
 * and grants a 48-hour grace period for human admin review.
 * 
 * @param {string} workerId - The database ID of the worker.
 * @param {string} bookingId - The booking ID associated with the trigger.
 * @param {string} triggerReason - Description of the violation or trigger (e.g., "Rating dropped below 3.0").
 */
const interceptDeactivation = async (workerId, bookingId, triggerReason) => {
  try {
    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) return null;

    // Check if there is already an active (pending) appeal for this worker
    const existingAppeal = await Appeal.findOne({
      worker: workerId,
      status: 'pending'
    });

    if (existingAppeal) {
      console.log(`[Penalty Hold] Active pending review already exists for Worker ${workerId}. Interception bypassed.`);
      return existingAppeal;
    }

    // Create a hold appeal
    const appeal = await Appeal.create({
      worker: workerId,
      booking: bookingId || null,
      reason: `System Auto-Deactivation Hold: ${triggerReason}. Account pending deletion/block review.`,
      status: 'pending'
    });

    console.log(`[Penalty Hold] Intercepted auto-deactivation for ${worker.user.name}. Created Appeal ID: ${appeal._id}`);

    // Notify the worker that a hold is placed and they have 48 hours to appeal or submit details
    const graceDate = new Date();
    graceDate.setHours(graceDate.getHours() + 48);

    await sendPushNotification(
      worker.user._id,
      'Account Under Review (Deactivation Hold)',
      `An issue has triggered automatic deactivation: "${triggerReason}". This has been put on hold for 48 hours (until ${graceDate.toLocaleDateString()}) pending manual review. You can submit details on the Grievance Page.`,
      { appealId: appeal._id, type: 'deactivation_hold' }
    );

    return appeal;
  } catch (error) {
    console.error('[Penalty Hold Middleware] Error intercepting deactivation:', error.message);
    return null;
  }
};

module.exports = { interceptDeactivation };
