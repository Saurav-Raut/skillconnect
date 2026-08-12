import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const WorkerJobsPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { bookingsList } = useSelector((state) => state.booking);

  const [avatarStr, setAvatarStr] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo?._id) {
      const saved = localStorage.getItem(`avatar_${userInfo._id}`);
      if (saved) setAvatarStr(saved);
    }
  }, [userInfo]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarStr(reader.result);
        if (userInfo?._id) {
          localStorage.setItem(`avatar_${userInfo._id}`, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarDelete = (e) => {
    e.stopPropagation();
    setAvatarStr(null);
    if (userInfo?._id) {
      localStorage.removeItem(`avatar_${userInfo._id}`);
    }
  };

  // Filter completed jobs for history
  const completedJobs = bookingsList ? bookingsList.filter(b => b.status === 'completed') : [];

  return (
    <div className="fade-in">
      <div className="main__head">
        <div>
          <div className="heading main__title">My Profile & Jobs</div>
          <div className="main__sub">Manage your bio, experience, and view your job history.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '30px' }} className="worker-jobs-layout">
        
        {/* Left Column: Bio & Experience */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '120px', height: '120px', borderRadius: '16px', background: 'var(--color-primary)', 
                margin: '0 auto 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                fontSize: '3rem', color: 'var(--bg-card)', position: 'relative', cursor: 'pointer',
                backgroundImage: avatarStr ? `url(${avatarStr})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              title="Click to upload profile photo"
            >
              {!avatarStr && <div style={{ marginTop: '10px' }}>{userInfo?.name?.charAt(0).toUpperCase() || 'W'}</div>}
              {!avatarStr && <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginTop: '8px' }}>Upload</div>}
              {avatarStr && (
                <div 
                  onClick={handleAvatarDelete}
                  style={{
                    position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger)', color: 'white',
                    width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '14px', cursor: 'pointer', border: '2px solid var(--bg-card)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                  title="Delete image"
                >✕</div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />

            <div className="heading" style={{ fontSize: '1.4rem' }}>{userInfo?.name || 'Worker Name'}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '16px' }}>Professional Electrician</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span className="badge badge-verified">ID Verified</span>
              <span className="badge" style={{ background: 'rgba(255,180,0,0.1)', color: '#ffb400' }}>
                ★ {userInfo?.workerProfile?.ratingAvg || 'New'}
              </span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: '12px' }}>Bio & Experience</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              I have over 5 years of experience in residential and commercial electrical work. I specialize in wiring, fan installations, and appliance repairs. I take pride in providing safe, reliable, and prompt service to all my clients.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
              <strong>Experience:</strong> 5+ Years<br/>
              <strong>Jobs completed:</strong> 28+<br/>
              <strong>Languages:</strong> Telugu, English, Hindi
            </div>
          </div>
        </div>

        {/* Right Column: Job History */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>Past Jobs</div>
            <span className="badge" style={{ background: 'var(--color-darkest)', color: 'var(--text-light)' }}>{completedJobs.length} total</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Job</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Date</th>
                  <th style={{ textAlign: 'right', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No completed jobs yet.
                    </td>
                  </tr>
                )}
                {completedJobs.map(job => (
                  <tr key={job._id}>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600 }}>{job.skill || 'General task'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{job.household?.user?.name || 'Household'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 600 }}>₹{job.amount || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .worker-jobs-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkerJobsPage;
