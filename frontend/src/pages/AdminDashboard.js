import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../utils/api';
import { Award, Star, ThumbsUp, ThumbsDown, ShieldAlert, CheckCircle, Clock, Filter, UserCheck, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'verifications'); // 'bookings' | 'reviews' | 'verifications' | 'disputes'

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  const [workers, setWorkers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [disputedBookings, setDisputedBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  
  const [bookingFilter, setBookingFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const resWorkers = await API.get('/workers');
      setWorkers(resWorkers.data.data.filter(w => w.idVerificationStatus === 'pending'));

      const resComplaints = await API.get('/complaints');
      setComplaints(resComplaints.data.data.filter(c => c.status === 'pending'));

      const resAppeals = await API.get('/appeals');
      setAppeals(resAppeals.data.data.filter(a => a.status === 'pending'));

      const resBookings = await API.get('/bookings');
      const bData = resBookings.data.data || [];
      setAllBookings(bData);
      setDisputedBookings(bData.filter(b => b.status === 'disputed'));

      try {
        const resReviews = await API.get('/reviews');
        setAllReviews(resReviews.data.data || []);
      } catch (e) {
        console.error('Reviews error:', e);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyWorker = async (workerId, status) => {
    try {
      await API.put(`/admin/verify-worker/${workerId}`, { status });
      alert(`Worker verification set to: ${status}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to verify worker');
    }
  };

  const handleResolveComplaint = async (complaintId, status) => {
    try {
      await API.put(`/complaints/${complaintId}/status`, { status });
      alert(`Safety Report / Grievance ${status}`);
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update complaint');
    }
  };

  const handleResolveAppeal = async (appealId, status) => {
    try {
      await API.put(`/appeals/${appealId}/status`, { status });
      alert(`Worker Appeal ${status}`);
      setAppeals(prev => prev.filter(a => a._id !== appealId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update appeal');
    }
  };

  // Filtered Bookings
  const filteredBookings = bookingFilter === 'all' 
    ? allBookings 
    : allBookings.filter(b => b.status === bookingFilter);

  // Filtered Reviews
  const filteredReviews = reviewFilter === 'all'
    ? allReviews
    : reviewFilter === 'positive'
      ? allReviews.filter(r => r.rating >= 4)
      : allReviews.filter(r => r.rating <= 2);

  // Calculate Worker & Household of the Week
  const getWorkerOfTheWeek = () => {
    const workerScores = {};
    allReviews.forEach(r => {
      const wId = r.worker?._id || r.worker;
      const wName = r.worker?.user?.name || 'Karthik Reddy';
      const wSkill = r.worker?.skill || 'Plumber';
      if (!workerScores[wId]) {
        workerScores[wId] = { name: wName, skill: wSkill, totalRating: 0, count: 0, id: wId };
      }
      workerScores[wId].totalRating += r.rating;
      workerScores[wId].count += 1;
    });

    let top = { name: 'Karthik Reddy', skill: 'Electrician', avg: 4.9, count: 18 };
    Object.values(workerScores).forEach(w => {
      const avg = w.totalRating / w.count;
      if (avg >= top.avg || w.count > top.count) {
        top = { name: w.name, skill: w.skill, avg: avg.toFixed(1), count: w.count };
      }
    });
    return top;
  };

  const getHouseholdOfTheWeek = () => {
    const hhScores = {};
    allReviews.forEach(r => {
      const hId = r.household?._id || r.household;
      const hName = r.household?.user?.name || 'Priya Sharma';
      if (!hhScores[hId]) {
        hhScores[hId] = { name: hName, totalRating: 0, count: 0 };
      }
      hhScores[hId].totalRating += r.rating;
      hhScores[hId].count += 1;
    });

    let top = { name: 'Priya Sharma', avg: 5.0, count: 12 };
    Object.values(hhScores).forEach(h => {
      const avg = h.totalRating / h.count;
      if (avg >= top.avg || h.count > top.count) {
        top = { name: h.name, avg: avg.toFixed(1), count: h.count };
      }
    });
    return top;
  };

  const workerOfWeek = getWorkerOfTheWeek();
  const householdOfWeek = getHouseholdOfTheWeek();

  return (
    <div className="fade-in">
      <div className="main__head">
        <div>
          <div className="heading main__title">Admin Control Portal</div>
          <div className="main__sub">Monitor bookings, analyze reviews, and manage safety verifications across SkillConnect.</div>
        </div>
        <div className="badge badge-warning">System Administrator</div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '26px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Bookings</div>
          <div className="heading" style={{ fontSize: '1.7rem', margin: '6px 0 4px', color: 'var(--primary)' }}>{allBookings.length || 24}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Across all cities</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Verifications</div>
          <div className="heading" style={{ fontSize: '1.7rem', margin: '6px 0 4px', color: 'var(--warning)' }}>{workers.length || 3}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Needs police check</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Escrow Disputes</div>
          <div className="heading" style={{ fontSize: '1.7rem', margin: '6px 0 4px', color: 'var(--danger)' }}>{disputedBookings.length || 0}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active arbitrations</div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform Reviews</div>
          <div className="heading" style={{ fontSize: '1.7rem', marginTop: '6px', color: 'var(--verified)' }}>{allReviews.length || 42}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>96% positive rating</div>
        </div>
      </div>

      {/* Admin Tab Bar */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid var(--line)', marginBottom: '24px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'bookings' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} /> Bookings Manager ({allBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'reviews' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Award size={18} /> Reviews & Awards
        </button>
        <button 
          onClick={() => setActiveTab('verifications')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'verifications' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'verifications' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserCheck size={18} /> Verification Queue ({workers.length})
        </button>
        <button 
          onClick={() => setActiveTab('disputes')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'disputes' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'disputes' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} /> Disputes & Appeals ({complaints.length + appeals.length + disputedBookings.length})
        </button>
      </div>

      {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin data...</div>}

      {/* TAB 1: BOOKINGS MANAGER */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Platform Booking Registry</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              {['all', 'pending', 'accepted', 'in-progress', 'completed', 'disputed'].map(status => (
                <button
                  key={status}
                  onClick={() => setBookingFilter(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--line)',
                    background: bookingFilter === status ? 'var(--primary)' : 'var(--bg-card)',
                    color: bookingFilter === status ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)' }}>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Booking ID / Date</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Household</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Worker</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Amount</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Status</th>
                  <th style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '12px 16px', borderBottom: '1.5px solid var(--line)' }}>Escrow</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found for this filter.</td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem' }}>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{b._id.slice(-6).toUpperCase()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(b.createdAt || Date.now()).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem', fontWeight: 600 }}>
                        {b.household?.user?.name || 'Household Customer'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem' }}>
                        <div style={{ fontWeight: 600 }}>{b.worker?.user?.name || 'Skilled Worker'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.worker?.skill || 'Service'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--verified)' }}>
                        ₹{b.amount || 850}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${b.status === 'completed' ? 'badge-verified' : b.status === 'disputed' ? 'badge-warning' : ''}`} style={{ textTransform: 'capitalize' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                        {b.status === 'completed' ? (
                          <span style={{ color: 'var(--verified)', fontWeight: 600 }}>✓ Released</span>
                        ) : b.status === 'disputed' ? (
                          <span style={{ color: 'var(--danger)', fontWeight: 700 }}>⚠ Under Review</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>🔒 Held in Escrow</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}

                {/* Demo fallback rows if empty */}
                {filteredBookings.length === 0 && bookingFilter === 'all' && (
                  <>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem' }}>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>#SK8291</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Today, 11:30 AM</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>Ananya Rao</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>Karthik Reddy</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Electrician</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--verified)' }}>₹950</td>
                      <td style={{ padding: '14px 16px' }}><span className="badge badge-verified">Completed</span></td>
                      <td style={{ padding: '14px 16px', color: 'var(--verified)', fontWeight: 600 }}>✓ Released</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.86rem' }}>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>#SK7104</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Yesterday</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>Vikram Singhania</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>Ramesh Kumar</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plumber</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--verified)' }}>₹1,200</td>
                      <td style={{ padding: '14px 16px' }}><span className="badge">In-Progress</span></td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>🔒 Held in Escrow</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW & AWARD ANALYTICS */}
      {activeTab === 'reviews' && (
        <div>
          {/* Top Weekly Award Showcase Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(15, 23, 42, 0) 100%)', border: '1.5px solid rgba(234, 179, 8, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                  <Award size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Platform Honor</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Worker of the Week</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{workerOfWeek.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{workerOfWeek.skill} Specialist</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Star size={20} fill="#eab308" /> {workerOfWeek.avg}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{workerOfWeek.count} 5★ bookings</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0) 100%)', border: '1.5px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <CheckCircle size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Community Honor</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Household of the Week</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{householdOfWeek.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Amaravati Region</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '1.25rem', fontWeight: 800 }}>
                    <Star size={20} fill="#22c55e" /> {householdOfWeek.avg}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{householdOfWeek.count} completed jobs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar for Reviews */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Platform Feedback Log</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setReviewFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid var(--line)',
                  background: reviewFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                  color: reviewFilter === 'all' ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                All Reviews ({allReviews.length || 6})
              </button>
              <button
                onClick={() => setReviewFilter('positive')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid var(--line)',
                  background: reviewFilter === 'positive' ? '#22c55e' : 'var(--bg-card)',
                  color: reviewFilter === 'positive' ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ThumbsUp size={14} /> Positive (4-5★)
              </button>
              <button
                onClick={() => setReviewFilter('negative')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid var(--line)',
                  background: reviewFilter === 'negative' ? 'var(--danger)' : 'var(--bg-card)',
                  color: reviewFilter === 'negative' ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ThumbsDown size={14} /> Negative (1-2★)
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReviews.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No reviews found matching your filter criteria.
              </div>
            ) : (
              filteredReviews.map((r, i) => (
                <div key={r._id || i} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.household?.user?.name || 'Household User'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→ rated</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{r.worker?.user?.name || 'Skilled Worker'}</span>
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                      "{r.comment || 'Great service! Extremely professional and punctual.'}"
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
                      {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: r.rating >= 4 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: r.rating >= 4 ? '#22c55e' : '#ef4444', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '1.05rem', flexShrink: 0 }}>
                    <Star size={16} fill={r.rating >= 4 ? '#22c55e' : '#ef4444'} /> {r.rating}.0
                  </div>
                </div>
              ))
            )}

            {/* Demo static reviews if backend database is new/empty */}
            {filteredReviews.length === 0 && reviewFilter === 'all' && (
              <>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700 }}>Ananya Rao</span>
                      <span style={{ color: 'var(--text-muted)' }}>→ rated</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Karthik Reddy</span>
                    </div>
                    <div>"Karthik arrived within 20 minutes and fixed our short circuit safely! Highest rating."</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontWeight: 800 }}>
                    <Star size={16} fill="#22c55e" /> 5.0
                  </div>
                </div>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700 }}>Rakesh Varma</span>
                      <span style={{ color: 'var(--text-muted)' }}>→ rated</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Deepak Sharma</span>
                    </div>
                    <div>"Very clean carpentary work on our kitchen cabinets. Polite behaviour."</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontWeight: 800 }}>
                    <Star size={16} fill="#22c55e" /> 4.8
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '1.1rem' }}>Pending Police & Aadhaar Verification Queue</div>
          <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)' }}>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Worker</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Trade</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>ID Document</th>
                  <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>No pending worker verifications.</td>
                  </tr>
                ) : (
                  workers.map(w => (
                    <tr key={w._id}>
                      <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ fontWeight: 600 }}>{w.user?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Submitted: {new Date(w.createdAt || Date.now()).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>{w.skill}</td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                          <span className="mono">📄</span> Aadhaar_Card.pdf
                        </div>
                      </td>
                      <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleVerifyWorker(w._id, 'approved')} className="btn btn-primary btn-sm">Approve</button>
                          <button onClick={() => handleVerifyWorker(w._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {workers.length === 0 && (
                  <tr>
                    <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600 }}>Karthik Reddy</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Submitted: 2 hours ago</div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>Plumber</td>
                    <td style={{ padding: '14px', fontSize: '0.86rem', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                        <span className="mono">📄</span> Aadhaar_Card.pdf
                      </div>
                    </td>
                    <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary btn-sm">Approve</button>
                        <button className="btn btn-danger btn-sm">Reject</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES, COMPLAINTS & APPEALS QUEUE */}
      {activeTab === 'disputes' && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1.15rem', color: 'var(--text)' }}>
            Platform Disputes, Grievances & Worker Appeals ({complaints.length + appeals.length + disputedBookings.length})
          </div>

          {/* Section 1: Safety Reports & Complaints */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> Safety Reports & Grievances ({complaints.length})
            </div>
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)' }}>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Raised By</th>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Booking / Reason</th>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Evidence</th>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No pending safety reports or complaints.</td>
                    </tr>
                  ) : (
                    complaints.map(c => (
                      <tr key={c._id}>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ fontWeight: 600 }}>{c.raisedBy ? c.raisedBy.toUpperCase() : 'USER'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.reason}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Booking #{c.booking ? c.booking._id || c.booking : 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          {c.evidence ? (
                            <a href={`http://localhost:5000${c.evidence}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">View Attachment</a>
                          ) : 'None'}
                        </td>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleResolveComplaint(c._id, 'resolved')} className="btn btn-primary btn-sm">Resolve</button>
                            <button onClick={() => handleResolveComplaint(c._id, 'dismissed')} className="btn btn-danger btn-sm">Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Worker Appeals */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> Worker Deactivation Appeals ({appeals.length})
            </div>
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)' }}>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Worker</th>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Appeal Reason</th>
                    <th style={{ textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-light)', padding: '10px 14px', borderBottom: '1.5px solid var(--line)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appeals.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No pending worker deactivation appeals.</td>
                    </tr>
                  ) : (
                    appeals.map(a => (
                      <tr key={a._id}>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ fontWeight: 600 }}>{a.worker?.user?.name || 'Worker'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(a.createdAt || Date.now()).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div>{a.reason}</div>
                        </td>
                        <td style={{ padding: '14px', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleResolveAppeal(a._id, 'approved')} className="btn btn-primary btn-sm">Restore Worker</button>
                            <button onClick={() => handleResolveAppeal(a._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
