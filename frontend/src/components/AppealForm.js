import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitAppeal } from '../redux/appealSlice';
import { Scale } from 'lucide-react';

const AppealForm = ({ bookingId, reviewId, initialReason = '', onComplete }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.appeal);

  const [reason, setReason] = useState(initialReason);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state the reason for your appeal.');
      return;
    }

    dispatch(submitAppeal({
      bookingId,
      reviewId,
      reason
    })).then((action) => {
      if (!action.error && onComplete) {
        onComplete();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Scale color="var(--primary)" />
        <span>Appeal Rating / Penalty Block</span>
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        State your case regarding the rating or block. System suspensions are held on a 48-hour countdown 
        until reviewed by human auditors.
      </p>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

      <div>
        <label>Your Appeal Statement</label>
        <textarea
          rows="4"
          placeholder="State your justification, providing details that refute the low rating or allegation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting Appeal...' : 'Submit Appeal Request'}
      </button>
    </form>
  );
};

export default AppealForm;
