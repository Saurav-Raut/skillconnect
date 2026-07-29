import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import API from '../utils/api';

const ReverseRatingForm = ({ bookingId, householdName, onComplete }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Worker rates household
      await API.post('/reviews/household', {
        bookingId,
        rating: parseInt(rating),
        comment
      });
      setLoading(false);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating for household');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Star color="var(--accent)" fill="var(--accent)" size={20} />
        <span>Rate Household ({householdName})</span>
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Provide feedback about workspace safety, facility access availability, and respectfulness.
      </p>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

      <div>
        <label>Household Safety & Decency Rating</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="5">5 - Highly Respectful & Safe</option>
          <option value="4">4 - Decent & Safe</option>
          <option value="3">3 - Satisfactory</option>
          <option value="2">2 - Minor Issues Faced</option>
          <option value="1">1 - Hostile / Safety Concerns</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <MessageSquare size={14} /> Comments / Feedback
        </label>
        <textarea
          rows="3"
          placeholder="Detail your experience with this household's safety and facilities..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent)' }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Household Review'}
      </button>
    </form>
  );
};

export default ReverseRatingForm;
