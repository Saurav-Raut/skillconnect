import React from 'react';
import { Link } from 'react-router-dom';
import { getWorkerAvatar } from '../utils/avatar';

const WorkerCard = ({ worker }) => {
  const { user, skill, ratePerHour, ratingAvg, _id } = worker;
  const isVerified = worker.idVerificationStatus === 'approved';
  
  // Generate random animated cartoon profile pic without checkered background
  const photoUrl = getWorkerAvatar(worker);

  const isLive = worker.lastLocationUpdate && (Date.now() - new Date(worker.lastLocationUpdate).getTime() < 60000); // 60s for demo
  
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="worker-card">
      <div className="worker-card__photo" style={{ backgroundImage: `url(${photoUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
        <div className="worker-card__gradient"></div>
      </div>
      <div className="worker-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="worker-card__name">{user?.name || 'Worker'}</div>
          {isVerified && (
            <span className="badge badge-verified" style={{ padding: '3px 7px' }}>✓</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
          {worker.lastLocationUpdate ? (
            isLive ? (
              <span className="badge-live"><span className="live-dot"></span> Live</span>
            ) : (
              <span className="badge-stale" title={`Updated ${timeAgo(worker.lastLocationUpdate)}`}>Last known</span>
            )
          ) : null}
        </div>

        <div className="worker-card__meta">
          {skill} · {worker.distanceKm != null ? `${worker.distanceKm.toFixed(1)} km away` : (worker.city || worker.address || 'Registered Location')}
        </div>
        
        <div className="worker-card__foot">
          <div className="worker-card__price mono">₹{ratePerHour * 8 || 800}/day</div>
          <div className="stars">★ {ratingAvg || 'New'}</div>
        </div>

        <Link to={`/profile?id=${_id}`} className="btn btn-primary btn-sm btn-full" style={{ marginTop: '14px' }}>
          View profile
        </Link>
      </div>

      <style>{`
        .worker-card {
          background: var(--bg-card);
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          transition: var(--transition-fast);
        }
        .worker-card:hover {
          box-shadow: 0 16px 32px rgba(13, 27, 42, 0.1);
          transform: translateY(-3px);
        }
        .worker-card__photo {
          height: 160px;
          background-size: cover;
          background-position: top center;
          position: relative;
        }
        .worker-card__gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%);
        }
        .worker-card__body {
          padding: 16px;
        }
        .worker-card__name {
          font-weight: 700;
          font-size: 0.98rem;
        }
        .worker-card__meta {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .worker-card__foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
        }
        .worker-card__price {
          font-weight: 600;
          font-size: 0.86rem;
        }
        .stars {
          color: var(--warning);
          font-size: 0.8rem;
        }
        .badge-live {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }
        .badge-stale {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          display: inline-flex;
          border: 1px solid var(--line);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default WorkerCard;
