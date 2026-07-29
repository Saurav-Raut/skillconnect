import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../redux/bookingSlice';

const HouseholdBookingsPage = () => {
  const dispatch = useDispatch();
  const { bookingsList, loading } = useSelector((state) => state.booking);
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge" style={{ background: 'rgba(255, 180, 0, 0.1)', color: '#ffb400' }}>Pending Worker Acceptance</span>;
      case 'accepted':
        return <span className="badge" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>Confirmed & Upcoming</span>;
      case 'in-progress':
        return <span className="badge" style={{ background: 'var(--color-primary)', color: 'var(--bg-card)' }}>Live / In-Progress</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="fade-in">
      <div className="main__head">
        <div>
          <div className="heading main__title">My Bookings</div>
          <div className="main__sub">Track your active requests and past jobs.</div>
        </div>
      </div>

      <div className="card">
        {loading && bookingsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading bookings...</div>
        ) : bookingsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
            You don't have any active or past bookings.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Worker</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Date / Time</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Status</th>
                  <th style={{ textAlign: 'right', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(booking => (
                  <tr key={booking._id}>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600 }}>{booking.worker?.user?.name || 'Worker'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{booking.worker?.skill || 'Task'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600 }}>{booking.date ? new Date(booking.date).toLocaleDateString() : 'TBD'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{booking.startTime || 'TBD'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 600 }}>
                      ₹{booking.amount || (booking.ratePerHour * booking.hours) || '0'}
                      <div style={{ marginTop: '8px' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => window.location.href = `/track-booking?bookingId=${booking._id}&workerId=${booking.worker?._id}&workerName=${booking.worker?.user?.name}`}
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdBookingsPage;
