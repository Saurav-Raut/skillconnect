import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../redux/bookingSlice';
import { Link } from 'react-router-dom';

const HouseholdDashboard = () => {
  const dispatch = useDispatch();
  const { bookingsList, loading, error } = useSelector((state) => state.booking);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // For demonstration, deriving active/completed stats from list
  const activeBookings = bookingsList.filter(b => ['in_progress', 'escrow_funded', 'accepted'].includes(b.status));
  const completedBookings = bookingsList.filter(b => b.status === 'completed');

  return (
    <div className="fade-in">
      <div className="main__head">
        <div>
          <div className="heading main__title">Good evening, {userInfo?.name || 'Priya'}</div>
          <div className="main__sub">You have {activeBookings.length} job(s) in progress and {completedBookings.length} completed.</div>
        </div>
        <Link to="/search" className="btn btn-primary">+ Book a worker</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '26px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active bookings</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>{activeBookings.length || 1}</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed this month</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>{completedBookings.length || 4}</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saved workers</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px' }}>3</div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '1rem' }}>{error}</div>}

      {/* JOB IN PROGRESS CARD */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700 }}>Job in progress</div>
          <span className="badge badge-verified"><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span> Face verified on arrival</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(150deg, var(--color-medium), var(--color-darkest))', flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Ravi Kumar · Electrician</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Wiring repair — started 12:40 PM · Escrow ₹800 held</div>
          </div>
          <Link to="/track-booking" className="btn btn-ghost btn-sm">Track live →</Link>
        </div>
      </div>

      <div style={{ fontWeight: 700, marginBottom: '12px', marginTop: '24px' }}>Upcoming</div>
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Worker</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Service</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Date</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Status</th>
              <th style={{ borderBottom: '1.5px solid var(--line)' }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Lakshmi Devi</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Deep cleaning</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Jul 22, 10:00 AM</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}><span className="badge badge-pending">Scheduled</span></td>
              <td style={{ padding: '14px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}><button className="btn btn-ghost btn-sm">Manage</button></td>
            </tr>
            {/* Dynamic data could be mapped here */}
            {bookingsList.filter(b => b.status === 'pending' || b.status === 'accepted').map(b => (
              <tr key={b._id}>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{b.worker?.user?.name || 'Unknown'}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{b.worker?.skill || 'Service'}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{new Date(b.date).toLocaleDateString()}</td>
                <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}><span className="badge badge-pending">{b.status}</span></td>
                <td style={{ padding: '14px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}><button className="btn btn-ghost btn-sm">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontWeight: 700, marginBottom: '12px', marginTop: '32px' }}>Recent history</div>
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Worker</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Service</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Date</th>
              <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Suresh Naidu</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Plumbing</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Jul 10</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)', color: 'var(--warning)', letterSpacing: '0.1em' }}>★★★★★</td>
            </tr>
            <tr>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: 'none' }}>Anitha K.</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: 'none' }}>Cooking</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: 'none' }}>Jul 3</td>
              <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: 'none', color: 'var(--warning)', letterSpacing: '0.1em' }}>★★★★☆</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default HouseholdDashboard;
