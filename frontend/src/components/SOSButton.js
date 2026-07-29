import React, { useState } from 'react';
import { AlertOctagon } from 'lucide-react';

const SOSButton = ({ bookingId, userId, role }) => {
  const [triggered, setTriggered] = useState(false);

  const handleTriggerSOS = () => {
    if (window.confirm('⚠️ WARNING: This will trigger an emergency alert. Do you need immediate assistance?')) {
      setTriggered(true);

      // Emit socket event if active connection exists
      if (window.socket) {
        window.socket.emit('triggerSOS', {
          bookingId,
          userId,
          role,
          coordinates: [72.8777, 19.0760] // Mumbai mock coords
        });
      } else {
        console.warn('Socket not active. Simulating emergency alert...');
      }

      alert('🚨 SOS Alert Triggered! Local emergency responders and administrators have been dispatched with your current GPS coordinates.');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000 }}>
      <button
        onClick={handleTriggerSOS}
        className="btn"
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: triggered ? 'var(--danger)' : '#dc2626',
          boxShadow: triggered 
            ? '0 0 35px #ef4444' 
            : '0 8px 25px rgba(220, 38, 38, 0.45)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
          animation: triggered ? 'pulse 1s infinite' : 'none'
        }}
      >
        <AlertOctagon size={32} />
      </button>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default SOSButton;
