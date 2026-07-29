import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import API from '../utils/api';

const ReviewForm = ({ bookingId, workerName, onComplete }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/reviews', {
        bookingId,
        rating: parseInt(rating),
        comment
      });
      setLoading(false);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Review submission failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Star color="var(--warning)" fill="var(--warning)" size={20} />
        <span>Rate {workerName}</span>
      </h3>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

      <div>
        <label>Rating Score</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="5">5 Stars (Excellent)</option>
          <option value="4">4 Stars (Good)</option>
          <option value="3">3 Stars (Satisfactory)</option>
          <option value="2">2 Stars (Poor)</option>
          <option value="1">1 Star (Unsatisfactory)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <MessageSquare size={14} /> Comments / Feedback
        </label>
        <textarea
          rows="3"
          placeholder="Share your feedback about the worker's quality, efficiency, and respect..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

export default ReviewForm;
