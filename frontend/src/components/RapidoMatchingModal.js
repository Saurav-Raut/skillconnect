import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  PhoneCall, 
  Navigation, 
  X, 
  Send, 
  RotateCcw,
  ShieldCheck,
  User
} from 'lucide-react';
import axios from 'axios';

const RapidoMatchingModal = ({
  isOpen,
  onClose,
  bookingId,
  skillRequested,
  radiusKm = 5,
  onOpenLiveMap,
  socket,
  userInfo
}) => {
  const [matchStatus, setMatchStatus] = useState('searching'); // 'searching' | 'matched' | 'failed'
  const [roundInfo, setRoundInfo] = useState({ round: 1, maxRounds: 3, workersContacted: 5 });
  const [matchedWorker, setMatchedWorker] = useState(null);
  const [matchedBooking, setMatchedBooking] = useState(null);
  const [failReason, setFailReason] = useState('');

  // Scoped Chat State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Scoped Call State
  const [showCallModal, setShowCallModal] = useState(false);
  const [callInfo, setCallInfo] = useState(null);

  useEffect(() => {
    if (bookingId && isOpen) {
      sessionStorage.setItem('rapido_active_booking', bookingId);
      const savedStatus = sessionStorage.getItem('rapido_match_status_' + bookingId);
      const savedWorker = sessionStorage.getItem('rapido_matched_worker_' + bookingId);
      const savedBooking = sessionStorage.getItem('rapido_matched_booking_' + bookingId);
      if (savedStatus === 'matched' && savedWorker) {
        setMatchStatus('matched');
        try {
          setMatchedWorker(JSON.parse(savedWorker));
          if (savedBooking) setMatchedBooking(JSON.parse(savedBooking));
        } catch (e) {
          console.error('Error parsing saved match:', e);
        }
      }
    }
  }, [bookingId, isOpen]);

  useEffect(() => {
    if (!isOpen || !socket || !bookingId) return;

    // Join room on mount and on reconnect
    socket.emit('joinRoom', { room: `booking_${bookingId}` });

    const handleReconnect = () => {
      socket.emit('joinRoom', { room: `booking_${bookingId}` });
    };

    // Listen for round progress updates
    const handleRoundProgress = (data) => {
      if (data.bookingId === bookingId) {
        setRoundInfo({
          round: data.round || 1,
          maxRounds: data.maxRounds || 3,
          workersContacted: data.workersContacted || 5
        });
      }
    };

    // Listen for worker acceptance match found!
    const handleMatchFound = (data) => {
      if (data.bookingId === bookingId) {
        setMatchStatus('matched');
        setMatchedWorker(data.worker);
        setMatchedBooking(data.booking || { _id: bookingId });
        sessionStorage.setItem('rapido_match_status_' + bookingId, 'matched');
        if (data.worker) sessionStorage.setItem('rapido_matched_worker_' + bookingId, JSON.stringify(data.worker));
        if (data.booking) sessionStorage.setItem('rapido_matched_booking_' + bookingId, JSON.stringify(data.booking));
      }
    };

    // Listen for match failure after 3 rounds
    const handleMatchFailed = (data) => {
      if (data.bookingId === bookingId) {
        setMatchStatus('failed');
        setFailReason(data.message || 'No available workers accepted after 3 rounds.');
        sessionStorage.setItem('rapido_match_status_' + bookingId, 'failed');
      }
    };

    // Listen for scoped chat messages
    const handleScopedMessage = (msg) => {
      if (msg.booking === bookingId) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('connect', handleReconnect);
    socket.on('rapidoRoundProgress', handleRoundProgress);
    socket.on('rapidoMatchFound', handleMatchFound);
    socket.on('rapidoMatchFailed', handleMatchFailed);
    socket.on('scopedMessageReceived', handleScopedMessage);

    return () => {
      socket.off('connect', handleReconnect);
      socket.off('rapidoRoundProgress', handleRoundProgress);
      socket.off('rapidoMatchFound', handleMatchFound);
      socket.off('rapidoMatchFailed', handleMatchFailed);
      socket.off('scopedMessageReceived', handleScopedMessage);
    };
  }, [isOpen, socket, bookingId]);

  // Load persistent chat history when opening chat modal
  const handleOpenChat = async () => {
    setShowChatModal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !bookingId) return;

    socket.emit('sendScopedMessage', {
      bookingId,
      senderId: userInfo?._id,
      senderRole: 'household',
      message: chatInput.trim()
    });
    setChatInput('');
  };

  // Load call reveal info
  const handleOpenCall = async () => {
    setShowCallModal(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/call`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
        setCallInfo(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching call info:', err);
    }
  };

  const handleCancelBooking = () => {
    if (socket && bookingId) {
      socket.emit('cancelRapidoBooking', {
        bookingId,
        cancelledBy: 'household'
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        color: '#fff',
        position: 'relative'
      }}>
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* SEARCHING / RADAR STATE */}
        {matchStatus === 'searching' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '2px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'pulse 1.8s infinite'
            }}>
              <Radar size={42} color="#818cf8" />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              Finding Nearby {skillRequested || 'Professional'}...
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '20px' }}>
              Broadcasting to the nearest available partners within <strong style={{ color: '#fff' }}>{radiusKm} km</strong>
            </p>

            {/* ROUND PROGRESS BAR */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                  Round {roundInfo.round} of {roundInfo.maxRounds}
                </span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>
                  Contacting {roundInfo.workersContacted} nearest workers
                </span>
              </div>
              <div style={{
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(roundInfo.round / roundInfo.maxRounds) * 100}%`,
                  background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            <button
              onClick={handleCancelBooking}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Cancel Match Request
            </button>
          </div>
        )}

        {/* MATCH FOUND / WINNER STATE */}
        {matchStatus === 'matched' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={40} color="#22c55e" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e', marginBottom: '6px' }}>
              Worker Matched & En Route!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '20px' }}>
              First partner accepted your booking. Escrow is locked.
            </p>

            {/* WORKER SUMMARY CARD */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.3rem',
                fontWeight: 700
              }}>
                {matchedWorker?.user?.name?.charAt(0) || <User />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {matchedWorker?.user?.name || 'Karthik Reddy'}
                  </span>
                  <ShieldCheck size={16} color="#22c55e" />
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>
                  {matchedWorker?.skill || skillRequested} • ⭐ {matchedWorker?.ratingAvg || 5.0}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={handleOpenChat}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  border: '1px solid #6366f1',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={16} /> Scoped Chat
              </button>

              <button
                onClick={handleOpenCall}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  border: '1px solid #22c55e',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <PhoneCall size={16} /> Call Partner
              </button>
            </div>

            <button
              onClick={() => {
                if (onOpenLiveMap) {
                  onOpenLiveMap(matchedBooking?._id || bookingId, matchedWorker);
                }
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
              }}
            >
              <Navigation size={18} /> Open Live Map (Rapido View)
            </button>
          </div>
        )}

        {/* FAILED STATE AFTER 3 ROUNDS */}
        {matchStatus === 'failed' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={40} color="#f59e0b" />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24', marginBottom: '8px' }}>
              No Partners Available Currently
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              {failReason}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setMatchStatus('searching');
                  // Trigger again with radiusKm * 2
                  if (socket && bookingId) {
                    socket.emit('startRapidoMatch', {
                      bookingId,
                      skill: skillRequested,
                      coordinates: [80.5180, 16.5190],
                      radiusKm: radiusKm * 2
                    });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={16} /> Retry (10km Radius)
              </button>
            </div>
          </div>
        )}

        {/* SCOPED CHAT MODAL DRAWER */}
        {showChatModal && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0f172a',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#818cf8" /> Scoped Booking Chat
              </h4>
              <button
                onClick={() => setShowChatModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGE LIST */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '4px'
            }}>
              {chatMessages.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', margin: 'auto' }}>
                  No messages yet. Send a message to coordinate arrival!
                </p>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMine = msg.senderRole === 'household' || msg.sender === userInfo?._id;
                  return (
                    <div
                      key={msg._id || i}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        background: isMine ? '#6366f1' : '#334155',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        maxWidth: '80%',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div>{msg.message}</div>
                      <span style={{ fontSize: '0.7rem', color: '#cbd5e1', opacity: 0.8, display: 'block', marginTop: '4px', textAlign: 'right' }}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* CHAT INPUT */}
            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* SCOPED CALL MODAL DRAWER */}
        {showCallModal && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0f172a',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowCallModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <PhoneCall size={34} color="#22c55e" />
            </div>

            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
              {callInfo?.targetName || 'Karthik Reddy'}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Active Booking Session • Number Reveal
            </p>

            <div style={{
              background: '#1e293b',
              padding: '16px 24px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '1.3rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: '#22c55e',
              marginBottom: '20px'
            }}>
              {callInfo?.targetPhone || '+91 98765 43210'}
            </div>

            <a
              href={`tel:${callInfo?.targetPhone || '+919876543210'}`}
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                borderRadius: '12px',
                background: '#22c55e',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '16px'
              }}
            >
              📞 Call Now
            </a>

            <div style={{
              fontSize: '0.75rem',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              💡 Twilio Proxy Voice Masking supported for Phase 2 upgrade
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `}</style>
    </div>
  );
};

export default RapidoMatchingModal;
