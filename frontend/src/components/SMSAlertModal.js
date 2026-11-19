import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, Check, X, Navigation, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

const SMSAlertModal = () => {
  const [jobAlert, setJobAlert] = useState(null); // { bookingId, customerName, skill, amount, address, timestamp }
  const [customerSMS, setCustomerSMS] = useState(null); // { bookingId, workerName, status, message }
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for custom SMS dispatch events from PaymentPage or demo triggers
    const handleIncomingJob = (e) => {
      const data = e.detail || {};
      setJobAlert({
        bookingId: data.bookingId || 'SK8291',
        customerName: data.customerName || 'Ananya Rao',
        skill: data.skill || 'Electrician',
        amount: data.amount || 950,
        address: data.address || 'Flat 4B, Amaravati Residency, Thullur',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    };

    const handleCustomerNotification = (e) => {
      const data = e.detail || {};
      setCustomerSMS({
        bookingId: data.bookingId || 'SK8291',
        workerName: data.workerName || 'Karthik Reddy',
        status: data.status || 'Accepted',
        message: data.message || 'Worker has accepted your request and is en route to your location!'
      });
    };

    window.addEventListener('incomingSMSJob', handleIncomingJob);
    window.addEventListener('customerSMSAlert', handleCustomerNotification);

    return () => {
      window.removeEventListener('incomingSMSJob', handleIncomingJob);
      window.removeEventListener('customerSMSAlert', handleCustomerNotification);
    };
  }, []);

  const handleAcceptJob = () => {
    if (!jobAlert) return;
    const alertData = { ...jobAlert };
    setJobAlert(null);

    // Notify backend if socket exists
    if (window.socket) {
      window.socket.emit('acceptBooking', { bookingId: alertData.bookingId });
    }

    // Trigger customer SMS alert
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('customerSMSAlert', {
        detail: {
          bookingId: alertData.bookingId,
          workerName: 'Karthik Reddy (Verified)',
          status: 'Accepted',
          message: 'Worker Karthik Reddy has ACCEPTED your booking! They are en route to your location.'
        }
      }));
    }, 600);
  };

  const handleRejectJob = () => {
    setJobAlert(null);
    alert('Booking request rejected. Customer will be notified and escrow refunded.');
  };

  return (
    <>
      {/* 1. WORKER INCOMING SMS JOB DISPATCH MODAL */}
      {jobAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          width: '90%',
          maxWidth: '400px',
          background: 'var(--bg-card)',
          border: '2px solid var(--primary)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Bell size={18} /> SMS Dispatch Alert
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jobAlert.timestamp}</span>
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            New Service Booking Request!
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            A local household has requested your skill and secured payment in Escrow.
          </div>

          <div style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '14px', marginBottom: '18px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Customer:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{jobAlert.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Skill Requested:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{jobAlert.skill}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Escrow Payout:</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--verified)' }}>₹{jobAlert.amount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--line)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning)' }} />
              <span>{jobAlert.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAcceptJob}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--verified)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
              }}
            >
              <Check size={18} /> Accept Job (SMS)
            </button>
            <button
              onClick={handleRejectJob}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <X size={18} /> Reject
            </button>
          </div>
        </div>
      )}

      {/* 2. HOUSEHOLD SMS ACCEPTANCE & TRACKING ALERT */}
      {customerSMS && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          width: '90%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '2px solid var(--verified)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--verified)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <MessageSquare size={18} /> SMS Acceptance Alert
            </div>
            <button
              onClick={() => setCustomerSMS(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Booking Accepted! Worker En Route
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.4 }}>
            "{customerSMS.message}"
          </div>

          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--verified)', flexShrink: 0 }} />
            <span>Worker ID verified by Aadhaar & Police Check. Payment secured in Escrow.</span>
          </div>

          <button
            onClick={() => {
              const bId = customerSMS.bookingId || 'SK8291';
              setCustomerSMS(null);
              navigate(`/tracking/${bId}`);
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Navigation size={18} /> Track Live on Map (LiveMatch View)
          </button>
        </div>
      )}

      {/* 3. FLOATING DEMO TRIGGER BUTTONS REMOVED */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default SMSAlertModal;
