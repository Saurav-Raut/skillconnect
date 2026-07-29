import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { registerFaceVerification, fetchWorkers } from '../redux/workerSlice';
import { fetchMe } from '../redux/userSlice';
import WorkerForm from '../components/WorkerForm';
import HouseholdProfileSettings from '../components/HouseholdProfileSettings';
import FaceScanner from '../components/FaceScanner';
import API from '../utils/api';
import { getWorkerAvatar } from '../utils/avatar';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profileId = searchParams.get('id');

  const { userInfo } = useSelector((state) => state.user);
  
  const [workerProfile, setWorkerProfile] = useState(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await API.get('/workers');
        if (profileId) {
          // Viewing someone else's public profile
          const profile = res.data.data.find(w => w._id === profileId);
          setWorkerProfile(profile);
        } else if (userInfo?.role === 'worker') {
          // Viewing own profile settings
          const profile = res.data.data.find(w => w.user?._id === userInfo?._id);
          setWorkerProfile(profile);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [profileId, userInfo]);

  const handleFaceScan = (faceData) => {
    dispatch(registerFaceVerification(faceData)).then((res) => {
      if (!res.error) {
        alert('Face signature generated and encrypted successfully.');
        setShowFaceModal(false);
      }
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading profile...</div>;
  }

  const isOwnProfile = !profileId || (workerProfile && workerProfile.user?._id === userInfo?._id);

  // PDF Public Profile View
  if (workerProfile && (!isOwnProfile || location.pathname.includes('public'))) {
    return (
      <div className="fade-in" style={{
        maxWidth: '1000px', margin: '0 auto', padding: '48px 6vw 90px',
        display: 'grid', gap: '36px'
      }} className="profile-layout">
        
        <aside>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px', position: 'sticky', top: '100px' }}>
            <img 
              src={getWorkerAvatar(workerProfile)} 
              alt={workerProfile.user?.name || 'Worker Avatar'}
              style={{
                width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 16px',
                objectFit: 'cover', border: '3px solid var(--primary)',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)', display: 'block'
              }}
            />
            
            <div className="heading" style={{ fontSize: '1.4rem' }}>{workerProfile.user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}>{workerProfile.skill} · {workerProfile.address || workerProfile.city || 'Thullur, AP'}</div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span className="badge badge-verified">✓ ID Verified</span>
              {workerProfile.faceEncodingEncrypted && <span className="badge badge-info">📷 Face Lock</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '16px 0', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{workerProfile.ratingAvg || '4.8'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rating</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>28</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jobs done</div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{workerProfile.ratePerHour * 8 || 800}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Per day</div>
              </div>
            </div>

            <Link to={`/booking-request?workerId=${workerProfile._id}`} className="btn btn-primary btn-full">Book {workerProfile.user?.name?.split(' ')[0]}</Link>
          </div>
        </aside>

        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>About</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {workerProfile.bio || 'I am a highly experienced professional dedicated to providing top-quality service. I ensure all jobs are completed on time and with the highest standards of safety and reliability. I have been serving the local community for several years.'}
            </p>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Availability</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="badge" style={{ 
                  background: ['Mon','Tue','Wed','Thu','Fri'].includes(d) ? 'var(--color-darkest)' : 'transparent', 
                  color: ['Mon','Tue','Wed','Thu','Fri'].includes(d) ? 'white' : 'var(--text-muted)', 
                  border: '1px solid var(--line)', padding: '8px 14px' 
                }}>{d}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Reviews <span className="badge" style={{ background: 'var(--line)', color: 'var(--text)' }}>128</span>
            </div>
            
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600 }}>Srinivas Rao</div>
                <div style={{ color: 'var(--warning)' }}>★★★★★</div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Excellent work, very professional and arrived right on time. Highly recommended for electrical repairs.</p>
              <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '8px' }}>July 14, 2026</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600 }}>Lakshmi T.</div>
                <div style={{ color: 'var(--warning)' }}>★★★★★</div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fixed the wiring issue in under an hour. Cleaned up after the job. Very polite.</p>
              <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '8px' }}>June 28, 2026</div>
            </div>
          </div>
        </div>

        <style>{`
          .profile-layout { grid-template-columns: 320px 1fr; }
          @media (max-width: 800px) { .profile-layout { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    );
  }

  // Settings View for own profile
  return (
    <div className="fade-in" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '1.5rem 0.5rem', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Profile & Identity Settings</h2>
      
      {userInfo?.role === 'household' && (
        <HouseholdProfileSettings userInfo={userInfo} />
      )}

      {userInfo?.role === 'worker' && workerProfile && (
        <>
          <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Facial Identity Lock</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Registering your facial signature allows check-in and check-out verification.
            </p>
            {workerProfile.faceEncodingEncrypted ? (
              <div>
                <span className="badge badge-success" style={{ marginBottom: '1rem', display: 'inline-block' }}>✓ Face Lock Active</span>
                <div>
                  <button onClick={() => setShowFaceModal(true)} className="btn btn-secondary btn-sm">Update Face Scan</button>
                </div>
              </div>
            ) : (
              <div>
                <span className="badge badge-warning" style={{ marginBottom: '1rem', display: 'inline-block' }}>! Face Lock Missing</span>
                <div>
                  <button onClick={() => setShowFaceModal(true)} className="btn btn-primary btn-sm">Enroll Face Lock</button>
                </div>
              </div>
            )}
          </div>

          {showFaceModal ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4>Register Biometric ID</h4>
                <button onClick={() => setShowFaceModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
              </div>
              <FaceScanner buttonText="Capture Face" onScanComplete={handleFaceScan} />
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Professional Details</h3>
              <WorkerForm
                initialData={workerProfile}
                onComplete={() => {
                  alert('Professional settings updated successfully!');
                  window.location.reload();
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
