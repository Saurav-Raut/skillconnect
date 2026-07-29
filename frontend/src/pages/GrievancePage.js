import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, submitComplaint } from '../redux/complaintSlice';
import { fetchAppeals } from '../redux/appealSlice';
import API from '../utils/api';

const GrievancePage = () => {
  const dispatch = useDispatch();
  const { complaintsList, loading } = useSelector((state) => state.complaint);
  const { appealsList } = useSelector((state) => state.appeal);
  
  const [subject, setSubject] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchComplaints());
    dispatch(fetchAppeals());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      alert("Subject and Message are required");
      return;
    }
    const formData = new FormData();
    formData.append('reason', `${subject} - ${message}`);
    if (bookingId) {
      formData.append('bookingId', bookingId);
    }
    try {
      await dispatch(submitComplaint(formData)).unwrap();
      alert("Support message sent! Our team will get back to you shortly.");
      setSubject('');
      setBookingId('');
      setMessage('');
    } catch (err) {
      alert(err || "Failed to submit grievance");
    }
  };

  const hasHistory = complaintsList.length > 0 || appealsList.length > 0;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 6vw 90px' }}>
      
      <div className="badge badge-warning" style={{ marginBottom: '16px' }}>Help & support</div>
      <div className="heading main__title" style={{ fontSize: '2rem', marginBottom: '16px' }}>How can we help?</div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Search our help center or contact our trust and safety team directly.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Booking issues</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cancellations, worker no-shows, or escrow disputes.</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Trust & safety</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Report a worker, face verification issues, or emergency.</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Payments</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Refund status, billing history, and escrow release.</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Account</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Updating profile, phone verification, and settings.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ fontWeight: 700, marginBottom: '16px' }}>Contact us</div>
        <form onSubmit={handleSubmit}>
          <div className="input-row" style={{ marginBottom: '16px' }}>
            <div className="field">
              <label>Subject</label>
              <input type="text" className="input" placeholder="What is this regarding?" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div className="field">
              <label>Booking ID (optional)</label>
              <input type="text" className="input" placeholder="e.g. 64a8f9..." value={bookingId} onChange={e => setBookingId(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Message</label>
            <textarea className="input" style={{ height: '120px', resize: 'vertical' }} placeholder="Describe the issue in detail..." value={message} onChange={e => setMessage(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }} disabled={loading}>{loading ? 'Sending...' : 'Send message'}</button>
        </form>
      </div>

      {hasHistory && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ fontWeight: 700, marginBottom: '16px' }}>Recent support tickets & appeals</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appealsList.map((a) => (
              <div key={a._id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600 }}>Appeal #{a._id.substring(18)}</div>
                  <div className="badge badge-pending">{a.status}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{a.reason}</div>
              </div>
            ))}
            
            {complaintsList.map((c) => (
              <div key={c._id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600 }}>Safety Report #{c._id.substring(18)}</div>
                  <div className="badge badge-pending">{c.status}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default GrievancePage;
