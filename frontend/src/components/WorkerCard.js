import React from 'react';
import { Link } from 'react-router-dom';
import { getWorkerAvatar } from '../utils/avatar';

const WorkerCard = ({ worker }) => {
  const { user, skill, ratePerHour, ratingAvg, _id } = worker;
  const isVerified = worker.idVerificationStatus === 'approved';
  
  // Generate random animated cartoon profile pic without checkered background
  const photoUrl = getWorkerAvatar(worker);

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
        
        <div className="worker-card__meta">
          {skill} · {worker.city || worker.address || 'Thullur, AP'}
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
      `}</style>
    </div>
  );
};

export default WorkerCard;
