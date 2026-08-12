import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, acceptBooking, verifyCheckIn, verifyCheckOut } from '../redux/bookingSlice';

import { Link } from 'react-router-dom';

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const { bookingsList, loading, error } = useSelector((state) => state.booking);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleAccept = (bookingId) => {
    dispatch(acceptBooking(bookingId));
  };

  const pendingRequests = bookingsList.filter(b => b.status === 'pending');
  const scheduledJobs = bookingsList.filter(b => ['accepted', 'escrow_funded', 'in_progress'].includes(b.status));

  const completedJobs = bookingsList.filter(b => b.status === 'completed');
  const jobsDone = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  
  const activeJobs = bookingsList.filter(b => ['accepted', 'escrow_funded', 'in_progress'].includes(b.status));
  const escrowHeld = activeJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  
  const rating = userInfo?.workerProfile?.ratingAvg || 5.0;

  // Toggle online status when viewing dashboard
  useEffect(() => {
    if (userInfo?._id && window.socket) {
      window.socket.emit('workerOnlineToggle', { workerId: userInfo._id, isOnline: true });
      
      return () => {
        window.socket.emit('workerOnlineToggle', { workerId: userInfo._id, isOnline: false });
      };
    }
  }, [userInfo]);

  return (
    <div className="fade-in">
      
      <div className="main__head">
        <div>
          <div className="heading main__title">Welcome back, {userInfo?.name || 'Worker'}</div>
          <div className="main__sub">{pendingRequests.length} new job requests waiting on your response.</div>
        </div>
        <span className="badge badge-verified"><span className="badge__dot" style={{ background: 'currentColor' }}></span> Verified worker</span>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '26px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross Earnings</div>
          <div className="heading" style={{ fontSize: '1.7rem', margin: '6px 0 4px' }}>₹{totalEarnings}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--verified)', fontWeight: 600 }}>All time</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Jobs done</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>{jobsDone}</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rating</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>{rating}</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Escrow held</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>₹{escrowHeld}</div>
        </div>
      </div>

      <div style={{ fontWeight: 700, marginBottom: '12px', marginTop: '24px' }}>New requests</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '26px' }}>
        {pendingRequests.length === 0 ? (
           <div className="card" style={{ color: 'var(--text-muted)' }}>No new requests at the moment.</div>
        ) : (
          pendingRequests.map(req => (
            <div className="card" key={req._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>{req.skill || req.skillRequested || 'New Job Request'}</div>
                <span className="mono" style={{ color: 'var(--text-light)', fontSize: '0.76rem' }}>Today, 4:30 PM</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0 16px' }}>
                {req.household?.user?.name || req.householdName || 'Household Customer'} · {(req.distanceKm || 2.1).toFixed(1)} km away
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleAccept(req._id)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Accept</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Decline</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ fontWeight: 700, marginBottom: '12px', marginTop: '24px' }}>Today's schedule</div>
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Time</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Household</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Job</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Status</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduledJobs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No scheduled jobs for today.
                </td>
              </tr>
            )}
            {scheduledJobs.map(job => (
               <tr key={job._id}>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{job.startTime || '4:30 PM'}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{job.household?.user?.name || 'Household'}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{job.skill || 'New request'}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}><span className="badge badge-pending">{job.status}</span></td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                  <Link to={`/track-booking?bookingId=${job._id}`} className="btn btn-primary btn-sm">Track live →</Link>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default WorkerDashboard;
