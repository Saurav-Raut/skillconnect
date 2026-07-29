import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../redux/bookingSlice';
import FacilityCheckbox from './FacilityCheckbox';
import { Calendar, Clock, Sparkles } from 'lucide-react';

const BookingForm = ({ workerId, workerRate, workerName, onComplete }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.booking);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hours, setHours] = useState(1);
  const [facilityAccessAgreed, setFacilityAccessAgreed] = useState(false);

  const totalAmount = workerRate * parseFloat(hours || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!facilityAccessAgreed) {
      alert('You must agree to basic facilities access for the worker.');
      return;
    }

    dispatch(createBooking({
      workerId,
      date,
      startTime,
      hours: parseFloat(hours),
      facilityAccessAgreed
    })).then((action) => {
      if (!action.error && onComplete) {
        onComplete();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px', margin: '0 auto' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Sparkles color="var(--primary)" />
        <span>Confirm Booking Request</span>
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Booking <strong>{workerName}</strong> at rate <strong>₹{workerRate}/hour</strong>.
      </p>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Calendar size={14} /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={14} /> Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label>Estimated Hours</label>
        <input
          type="number"
          min="1"
          max="24"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
        />
      </div>

      {/* Facility check disclosure */}
      <FacilityCheckbox
        checked={facilityAccessAgreed}
        onChange={setFacilityAccessAgreed}
      />

      <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Cost</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>₹{totalAmount}</p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Complete Escrow Book'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
