import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="fade-in">
      <div className="main__head">
        <div className="heading main__title">Notifications</div>
      </div>

      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'inline-block', padding: '12px 0', borderBottom: '2px solid var(--text)', fontWeight: 700, marginRight: '24px', cursor: 'pointer' }}>All</div>
        <div style={{ display: 'inline-block', padding: '12px 0', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Unread</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', display: 'flex', gap: '16px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Booking confirmed: Ravi Kumar</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Your escrow deposit of ₹800 is held safely. The worker will arrive at 10:00 AM on Jul 22.</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>2 hours ago</div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '16px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'transparent', marginTop: '6px', flexShrink: 0 }}></div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Security alert: New login detected</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>We detected a new login to your account from Chrome on Windows.</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Yesterday</div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '16px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'transparent', marginTop: '6px', flexShrink: 0 }}></div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Welcome to SkillConnect</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Thanks for joining! Set up your profile and make your first booking today.</div>
            <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Jul 18</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
