import React from 'react';
import { Droplet, HelpCircle } from 'lucide-react';

const FacilityCheckbox = ({ checked, onChange }) => {
  return (
    <div className="glass" style={{
      padding: '1rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
        <div style={{ marginTop: '0.2rem' }}>
          <input
            type="checkbox"
            id="facilityAccess"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            required
          />
        </div>
        <div>
          <label htmlFor="facilityAccess" style={{
            fontSize: '0.92rem',
            color: 'var(--text-main)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.2rem'
          }}>
            <Droplet size={16} color="#06b6d4" />
            <span>Basic Facilities Access Disclosure</span>
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.25' }}>
            I agree to provide the worker with access to basic facilities during the service, including 
            <strong> drinking water</strong>, <strong>restroom access</strong>, and a <strong>decent rest area</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacilityCheckbox;
