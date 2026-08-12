import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkerById } from '../redux/workerSlice';
import { createBooking } from '../redux/bookingSlice';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('workerId');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWorker, loading, error } = useSelector((state) => state.worker);
  const bookingState = useSelector((state) => state.booking);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [days, setDays] = useState(1);

  useEffect(() => {
    if (workerId) {
      dispatch(fetchWorkerById(workerId));
    }
  }, [dispatch, workerId]);

  const handleBooking = () => {
    if (!date || !startTime) {
      alert("Please select a date and time.");
      return;
    }
    
    // We convert days into hours for backend compatibility (1 day = 8 hours)
    dispatch(createBooking({
      workerId,
      date,
      startTime,
      hours: days * 8,
      facilityAccessAgreed: true
    })).then((action) => {
      if (action.error) {
        alert('Failed to create booking: ' + (action.payload || 'Unknown error'));
        return;
      }
      const wName = currentWorker?.user?.name || 'Karthik Reddy';
      const wSkill = currentWorker?.skill || 'Electrician';
      const bId = action.payload?.data?._id || action.payload?._id;
      if (!bId) {
        alert('Failed to create booking: Invalid response from server');
        return;
      }
      navigate(`/payment/${bId}?amount=${total}&worker=${encodeURIComponent(wName)}&skill=${encodeURIComponent(wSkill)}`);
    });
  };

  const ratePerDay = currentWorker ? (currentWorker.ratePerHour * 8 || 800) : 0;
  const platformFee = 50;
  const total = (ratePerDay * days) + platformFee;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 6vw 90px' }}>
      <div className="badge badge-verified" style={{ marginBottom: '16px' }}>Booking checkout</div>
      <div className="heading main__title" style={{ fontSize: '2rem', marginBottom: '16px' }}>Confirm your booking</div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Review details and secure your payment in escrow until the job is done.</p>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading worker details...</div>}
      {error && <div style={{ color: 'var(--danger)', fontWeight: 600, textAlign: 'center' }}>{error}</div>}

      {currentWorker && (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px' }}>Worker details</div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(150deg, var(--color-medium), var(--color-darkest))'
              }}></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{currentWorker.user?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentWorker.skill} · ★ {currentWorker.ratingAvg || '4.8'}</div>
              </div>
            </div>

            <div className="input-row" style={{ marginTop: '24px' }}>
              <div className="field">
                <label>Date</label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="field">
                <label>Start time</label>
                <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
            </div>

            <div className="field" style={{ marginTop: '16px' }}>
              <label>Estimated duration (days)</label>
              <input type="number" min="1" className="input" value={days} onChange={(e) => setDays(e.target.value)} required />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '16px' }}>Payment summary</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div>{days} day(s) × ₹{ratePerDay}</div>
              <div>₹{ratePerDay * days}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div>Platform trust & safety fee</div>
              <div>₹{platformFee}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)', marginBottom: '24px', fontWeight: 700, fontSize: '1.1rem' }}>
              <div>Total Escrow Deposit</div>
              <div className="mono">₹{total}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px', backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--verified)' }}>✓</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>100% Escrow Protection</strong>
                Your money is held safely. The worker only gets paid after you confirm face-verified check-out on site.
              </div>
            </div>

            <button onClick={handleBooking} className="btn btn-primary btn-full" disabled={bookingState.loading}>
              {bookingState.loading ? 'Processing...' : `Proceed to Payment (₹${total}) →`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-light)', marginTop: '14px' }}>
              By confirming, you agree to the SkillConnect terms of service.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingPage;
