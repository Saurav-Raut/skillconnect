import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SMSAlertModal from './SMSAlertModal';
import RapidoMatchingModal from './RapidoMatchingModal';
import WorkerRapidoIncomingModal from './WorkerRapidoIncomingModal';
import LiveMap from './LiveMap';

const AppShell = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();

  const isHousehold = userInfo?.role === 'household';
  const isWorker = userInfo?.role === 'worker';
  const isAdmin = userInfo?.role === 'admin';

  const [avatarStr, setAvatarStr] = useState(null);
  const fileInputRef = useRef(null);

  // Rapido Live Matching & Tracking state
  const [isRapidoOpen, setIsRapidoOpen] = useState(false);
  const [activeRapidoBookingId, setActiveRapidoBookingId] = useState('rapido_' + Date.now());
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [liveMapBookingId, setLiveMapBookingId] = useState(null);
  const [liveMapWorker, setLiveMapWorker] = useState(null);

  const startRapidoMatchHandler = () => {
    const newBid = '64010a1b2c3d4e5f60718293'; // valid mongo format demo bookingId
    setActiveRapidoBookingId(newBid);
    setIsRapidoOpen(true);

    if (window.socket) {
      window.socket.emit('startRapidoMatch', {
        bookingId: newBid,
        skill: 'Electrician',
        coordinates: [80.5180, 16.5190], // Thullur AP default
        addressText: 'Thullur, Amaravati, Andhra Pradesh',
        radiusKm: 5,
        householdName: userInfo?.name || 'Household Customer',
        ratePerHour: 150,
        totalAmount: 300
      });
    }
  };
  
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

  const handleLogout = () => {
    dispatch({ type: 'user/logout' });
    window.location.href = '/';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/" className="sidebar__brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="sidebar__mark"></span>SkillConnect
        </Link>
        
        <div className="sidebar__nav">
          {isHousehold && (
            <>
              <Link to="/dashboard" className={`sidebar__link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <span className="sidebar__icon">⌂</span>Dashboard
              </Link>
              <Link to="/search" className={`sidebar__link ${location.pathname === '/search' ? 'active' : ''}`}>
                <span className="sidebar__icon">⌕</span>Find workers
              </Link>
              <Link to="/my-bookings" className={`sidebar__link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                <span className="sidebar__icon">▤</span>Bookings
              </Link>
              <Link to="/track-booking" className={`sidebar__link ${location.pathname === '/track-booking' ? 'active' : ''}`}>
                <span className="sidebar__icon">◎</span>Tracking
              </Link>
            </>
          )}

          {isWorker && (
            <>
              <Link to="/dashboard" className={`sidebar__link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <span className="sidebar__icon">⌂</span>Dashboard
              </Link>
              <Link to="/jobs" className={`sidebar__link ${location.pathname === '/jobs' ? 'active' : ''}`}>
                <span className="sidebar__icon">▤</span>My jobs
              </Link>
              <Link to="/earnings" className={`sidebar__link ${location.pathname === '/earnings' ? 'active' : ''}`}>
                <span className="sidebar__icon">₹</span>Earnings
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin?tab=verifications" className={`sidebar__link ${location.pathname === '/admin' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'verifications') ? 'active' : ''}`}>
                <span className="sidebar__icon">◎</span>Verification queue
              </Link>
              <Link to="/admin?tab=disputes" className={`sidebar__link ${new URLSearchParams(location.search).get('tab') === 'disputes' ? 'active' : ''}`}>
                <span className="sidebar__icon">⚖</span>Disputes & Appeals
              </Link>
              <Link to="/admin?tab=bookings" className={`sidebar__link ${new URLSearchParams(location.search).get('tab') === 'bookings' ? 'active' : ''}`}>
                <span className="sidebar__icon">▤</span>Bookings Registry
              </Link>
              <Link to="/admin?tab=reviews" className={`sidebar__link ${new URLSearchParams(location.search).get('tab') === 'reviews' ? 'active' : ''}`}>
                <span className="sidebar__icon">☺</span>Reviews & Awards
              </Link>
            </>
          )}

          <Link to="/notifications" className={`sidebar__link ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <span className="sidebar__icon">🛎</span>Notifications
          </Link>
          <Link to="/profile" className={`sidebar__link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <span className="sidebar__icon">☺</span>Profile
          </Link>
          
          {/* Logout Button */}
          <div 
            className="sidebar__link sidebar__link-logout" 
            style={{ cursor: 'pointer', color: 'var(--warning)', marginTop: 'auto' }}
            onClick={() => {
              dispatch({ type: 'user/logout' });
              window.location.href = '/';
            }}
          >
            <span className="sidebar__icon">↪</span>Logout
          </div>
        </div>

        <div className="sidebar__foot" style={{ position: 'relative', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', paddingBottom: '10px' }}>
          <div 
            className="sidebar__avatar" 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              backgroundImage: avatarStr ? `url(${avatarStr})` : 'none', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              margin: '0 auto'
            }}
            title="Click to upload image"
          >
            {!avatarStr && <span style={{ opacity: 0.5, fontSize: '10px' }}>Upload</span>}
            {avatarStr && (
              <div 
                onClick={handleAvatarDelete}
                style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white',
                  width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '12px', cursor: 'pointer', border: '2px solid var(--color-dark)'
                }}
                title="Delete image"
              >✕</div>
            )}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
          
          <div>
            <div className="sidebar__name" style={{ fontSize: '1.05rem', marginTop: '-2px' }}>{userInfo?.name || 'User'}</div>
            <div className="sidebar__role" style={{ textTransform: 'capitalize' }}>
              {userInfo?.role || 'Guest'} {isWorker && '· Verified'}
            </div>
          </div>
        </div>
      </aside>
      
      <SMSAlertModal onStartRapidoMatch={startRapidoMatchHandler} />

      {/* RAPIDO MODALS & REAL-TIME WIRE UP */}
      <RapidoMatchingModal
        isOpen={isRapidoOpen}
        onClose={() => setIsRapidoOpen(false)}
        bookingId={activeRapidoBookingId}
        skillRequested="Electrician"
        radiusKm={5}
        socket={window.socket}
        userInfo={userInfo}
        onOpenLiveMap={(bid, wkr) => {
          setLiveMapBookingId(bid || activeRapidoBookingId);
          setLiveMapWorker(wkr);
          setShowLiveMap(true);
        }}
      />

      <WorkerRapidoIncomingModal
        socket={window.socket}
        userInfo={userInfo}
        onOpenLiveMap={(bid, wkr) => {
          setLiveMapBookingId(bid || activeRapidoBookingId);
          setLiveMapWorker(wkr);
          setShowLiveMap(true);
        }}
      />

      {showLiveMap && (
        <LiveMap
          bookingId={liveMapBookingId || activeRapidoBookingId}
          onClose={() => setShowLiveMap(false)}
          workerName={liveMapWorker?.user?.name || 'Karthik Reddy'}
          workerPhone={liveMapWorker?.user?.phone || '+91 98765 43210'}
          workerSkill={liveMapWorker?.skill || 'Electrician'}
          workerRating={liveMapWorker?.ratingAvg || 5.0}
        />
      )}

      <main className="main">
        <div className="main__body">
          {children}
        </div>

        <div className="app-footer">
          <div>© 2026 SkillConnect · Thullur, AP</div>
          <div>
            <Link to="/support">Help & support</Link> &nbsp;·&nbsp;
            <a href="#terms">Terms</a> &nbsp;·&nbsp;
            <a href="#privacy">Privacy</a>
          </div>
        </div>
      </main>

      <style>{`
        .app {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
        }
        .sidebar {
          background: linear-gradient(175deg, #0f172a 0%, #1e1b4b 100%);
          color: #f8fafc;
          padding: 26px 20px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
        }
        .sidebar__brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 40px;
          padding: 0 8px;
          letter-spacing: -0.02em;
        }
        .sidebar__mark {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--warning), #f97316);
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
        }
        .sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .sidebar__link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .sidebar__link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }
        .sidebar__link.active {
          color: #ffffff;
          background: linear-gradient(90deg, var(--primary) 0%, #818cf8 100%);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .sidebar__link.active .sidebar__icon {
          opacity: 1;
        }
        .sidebar__icon {
          width: 20px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.95rem;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .sidebar__link-logout:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: var(--danger) !important;
        }
        .sidebar__foot {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar__avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(250,247,240,0.12);
          flex-shrink: 0;
        }
        .sidebar__name {
          font-size: 0.82rem;
          font-weight: 700;
        }
        .sidebar__role {
          font-size: 0.72rem;
          color: rgba(250,247,240,0.5);
        }
        .main {
          padding: 36px 44px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main__body {
          flex: 1;
        }
        .main__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 14px;
        }
        .main__title {
          font-size: 1.7rem;
        }
        .main__sub {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 5px;
        }
        .app-footer {
          margin-top: 36px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.76rem;
          color: var(--text-muted);
        }
        .app-footer a {
          color: var(--text-muted);
          font-weight: 600;
        }
        .app-footer a:hover {
          color: var(--color-darkest);
        }
        @media (max-width: 900px) {
          .app { grid-template-columns: 1fr; }
          .sidebar { position: relative; height: auto; flex-direction: row; overflow-x: auto; padding: 14px 20px; }
          .sidebar__nav { flex-direction: row; }
          .sidebar__foot { display: none; }
          .main { padding: 24px 20px; }
        }
      `}</style>
    </div>
  );
};

export default AppShell;
