import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  X, 
  DollarSign, 
  Award 
} from 'lucide-react';

const WorkerRapidoIncomingModal = ({
  socket,
  userInfo,
  onOpenLiveMap
}) => {
  const [activeRequest, setActiveRequest] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [cardStatus, setCardStatus] = useState('incoming'); // 'incoming' | 'won' | 'already_taken' | null
  const [alreadyTakenMessage, setAlreadyTakenMessage] = useState('');

  useEffect(() => {
    if (!socket || !userInfo?._id) return;

    const handleIncomingRequest = (data) => {
      // Check if this broadcast is for this worker
      if (!data || (data.workerId && data.workerId !== userInfo._id)) {
        return;
      }
      console.log('[WorkerRapidoIncomingModal] Received incoming request:', data);
      setActiveRequest(data);
      setCountdown(data.countdownSeconds || 30);
      setCardStatus('incoming');
    };

    const handleAlreadyTaken = (data) => {
      if (!activeRequest || data.bookingId !== activeRequest.bookingId) return;

      console.log('[WorkerRapidoIncomingModal] Job already taken:', data);
      setCardStatus('already_taken');
      setAlreadyTakenMessage(data.message || 'Job Already Taken by another nearby worker.');

      // Auto close after 3 seconds
      setTimeout(() => {
        setCardStatus(null);
        setActiveRequest(null);
      }, 3000);
    };

    const handleWinSuccess = (data) => {
      if (!activeRequest || data.bookingId !== activeRequest.bookingId) return;

      console.log('[WorkerRapidoIncomingModal] Job Won:', data);
      setCardStatus('won');
    };

    socket.on('incomingRapidoRequest', handleIncomingRequest);
    socket.on('rapidoJobAlreadyTaken', handleAlreadyTaken);
    socket.on('rapidoJobWinSuccess', handleWinSuccess);

    return () => {
      socket.off('incomingRapidoRequest', handleIncomingRequest);
      socket.off('rapidoJobAlreadyTaken', handleAlreadyTaken);
      socket.off('rapidoJobWinSuccess', handleWinSuccess);
    };
  }, [socket, userInfo, activeRequest]);

  // Handle countdown timer
  useEffect(() => {
    if (cardStatus !== 'incoming' || !activeRequest) return;

    if (countdown <= 0) {
      // Auto reject on timeout
      handleReject();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cardStatus, countdown, activeRequest]);

  const handleAccept = () => {
    if (!socket || !activeRequest || !userInfo?._id) return;
    socket.emit('acceptRapidoJob', {
      bookingId: activeRequest.bookingId,
      workerId: userInfo._id
    });
  };

  const handleReject = () => {
    if (socket && activeRequest && userInfo?._id) {
      socket.emit('rejectRapidoJob', {
        bookingId: activeRequest.bookingId,
        workerId: userInfo._id
      });
    }
    setCardStatus(null);
    setActiveRequest(null);
  };

  if (!cardStatus || !activeRequest) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      width: '100%',
      maxWidth: '400px',
      padding: '12px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '24px',
        border: cardStatus === 'won' 
          ? '2px solid #22c55e' 
          : cardStatus === 'already_taken' 
            ? '2px solid #f59e0b' 
            : '2px solid #6366f1',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        padding: '24px',
        color: '#fff',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* TOP STATUS HEADER */}
        {cardStatus === 'incoming' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8'
                }}>
                  <Bell size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#818cf8', display: 'block' }}>
                    NEW RAPIDO BOOKING BROADCAST
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Round {activeRequest.round || 1} • Nearest 5 Workers
                  </span>
                </div>
              </div>

              {/* 30-SECOND CIRCULAR TIMER PILL */}
              <div style={{
                background: countdown <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: countdown <= 10 ? '#ef4444' : '#818cf8',
                border: `1px solid ${countdown <= 10 ? '#ef4444' : '#6366f1'}`,
                padding: '6px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock size={14} /> {countdown}s
              </div>
            </div>

            {/* JOB DETAILS CARD */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  {activeRequest.skill || 'Electrician'} Job
                </span>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  fontSize: '0.9rem'
                }}>
                  ₹{activeRequest.totalAmount || 300}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '6px' }}>
                <MapPin size={16} color="#818cf8" />
                <span>{activeRequest.approximateAddress || 'Thullur, Amaravati, AP'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <span>📍 {activeRequest.distanceKm || 1.4} km away</span>
                <span>⏱️ {activeRequest.hours || 2} hr(s)</span>
              </div>
            </div>

            {/* ACCEPT / REJECT BUTTONS */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReject}
                style={{
                  flex: '0 0 100px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reject
              </button>

              <button
                onClick={handleAccept}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle size={18} /> Accept Job Now
              </button>
            </div>
          </>
        )}

        {/* ALREADY TAKEN BY ANOTHER WORKER */}
        {cardStatus === 'already_taken' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <AlertTriangle size={32} color="#f59e0b" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
              Job Already Taken!
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '8px' }}>
              {alreadyTakenMessage}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Auto-closing in 3 seconds...
            </span>
          </div>
        )}

        {/* WON JOB STATE */}
        {cardStatus === 'won' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e', marginBottom: '6px' }}>
              You Won The Job!
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>
              You accepted first. Customer is waiting for your arrival.
            </p>
            <button
              onClick={() => {
                if (onOpenLiveMap) {
                  onOpenLiveMap(activeRequest.bookingId, userInfo);
                }
                setCardStatus(null);
                setActiveRequest(null);
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Navigation size={18} /> Open Live Navigation
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WorkerRapidoIncomingModal;
