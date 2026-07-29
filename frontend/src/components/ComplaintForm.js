import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComplaint } from '../redux/complaintSlice';
import ImageUploader from './ImageUploader';
import { ShieldAlert } from 'lucide-react';

const ComplaintForm = ({ bookingId, householdName, onComplete }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.complaint);

  const [reason, setReason] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please add a reason for the complaint.');
      return;
    }

    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('reason', reason);
    if (evidenceFile) {
      formData.append('evidence', evidenceFile);
    }

    dispatch(submitComplaint(formData)).then((action) => {
      if (!action.error && onComplete) {
        onComplete();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', color: 'var(--danger)' }}>
        <ShieldAlert color="var(--danger)" />
        <span>Report Safety/Dispute Incident</span>
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        File an official complaint against household: <strong>{householdName}</strong>. 
        Your statement will be manually audited by administrators.
      </p>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>}

      <div>
        <label>Reason / Description of Incident</label>
        <textarea
          rows="4"
          placeholder="Describe exactly what occurred (e.g. unsafe environment, denial of facility access, payment refusal)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      <ImageUploader
        labelText="Attach Photo Evidence (Optional)"
        onFileSelect={setEvidenceFile}
      />

      <button type="submit" className="btn btn-danger" disabled={loading}>
        {loading ? 'Filing Report...' : 'File Official Complaint'}
      </button>
    </form>
  );
};

export default ComplaintForm;
