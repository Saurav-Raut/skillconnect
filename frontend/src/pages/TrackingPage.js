import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings, verifyCheckIn, verifyCheckOut } from '../redux/bookingSlice';
import API from '../utils/api';
import LiveMap from '../components/LiveMap';
import SOSButton from '../components/SOSButton';
import FaceScanner from '../components/FaceScanner';

const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const { bookingId: paramBookingId } = useParams();
  const bookingId = paramBookingId || searchParams.get('bookingId') || 'SK8291';
  const workerId = searchParams.get('workerId');
  
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const { bookingsList, loading } = useSelector((state) => state.booking);
  
  const booking = bookingsList.find(b => b._id === bookingId);
  const workerName = booking?.worker?.user?.name || searchParams.get('workerName') || 'Karthik Reddy';
  
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [scanType, setScanType] = useState(''); // 'checkin' or 'checkout'
  const [demoStatus, setDemoStatus] = useState(null);
  
  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const status = demoStatus || booking?.status || 'pending';

  const handleFaceScan = (faceData) => {
    if (scanType === 'checkin') {
      dispatch(verifyCheckIn({ bookingId, faceData })).then((action) => {
        if (!action.error) {
          alert('Worker verified and checked in successfully!');
          setShowFaceScanner(false);
          setDemoStatus('in_progress');
          dispatch(fetchBookings());
        } else {
          alert('Check-in failed: ' + action.payload);
        }
      });
    } else if (scanType === 'checkout') {
      dispatch(verifyCheckOut({ bookingId, faceData })).then((action) => {
        if (!action.error) {
          alert('Worker checked out. Escrow funds have been released!');
          setShowFaceScanner(false);
          setDemoStatus('completed');
          dispatch(fetchBookings());
        } else {
          alert('Check-out failed: ' + action.payload);
        }
      });
    }
  };

  const handleInstantCheckIn = () => {
    dispatch(verifyCheckIn({ bookingId, faceData: 'demo-match-token' })).then((action) => {
      if (!action.error) {
        alert('Worker checked in successfully (Demo verification)!');
        setDemoStatus('in_progress');
        dispatch(fetchBookings());
      } else {
        alert('Demo check-in failed: ' + (action.payload || 'Unknown error'));
      }
    });
  };

  const handleInstantCheckOut = () => {
    dispatch(verifyCheckOut({ bookingId, faceData: 'demo-match-token' })).then((action) => {
      if (!action.error) {
        alert('Worker checkout verified! Escrow funds released (Demo verification).');
        setDemoStatus('completed');
        dispatch(fetchBookings());
      } else {
        alert('Demo check-out failed: ' + (action.payload || 'Unknown error'));
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (bookingId && !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
        setReviewSubmitted(true);
        alert('Review submitted successfully!');
        return;
      }
      if (userInfo?.role === 'household') {
        await API.post('/reviews', { bookingId, rating: reviewRating, comment: reviewComment });
      } else {
        await API.post('/reviews/household', { bookingId, rating: reviewRating, comment: reviewComment });
      }
      setReviewSubmitted(true);
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  return (
    <div className="tracking-layout fade-in">
      
      {/* Sidebar with Timeline */}
      <div className="tracking-sidebar">
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Live tracking</span>
          <span className="badge badge-verified"><span className="badge__dot" style={{ background: 'currentColor' }}></span> Encrypted</span>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontWeight: 700 }}>{workerName}</div>
            <div style={{ color: 'var(--success)', fontWeight: 600 }}>Arriving in 12 mins</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Wiring repair · Escrow ₹800 held
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Message</button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Call (Masked)</button>
          </div>
        </div>

        <div style={{ fontWeight: 700, marginBottom: '16px' }}>Timeline</div>
        
        <div style={{ position: 'relative', paddingLeft: '20px' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '5px', width: '2px', background: 'var(--line)' }}></div>
          
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', left: '-20px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--verified)', border: '2px solid var(--bg-card)' }}></div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Booking confirmed</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '2px' }}>Done</div>
          </div>

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', left: '-20px', width: '12px', height: '12px', borderRadius: '50%', background: status === 'accepted' ? 'var(--warning)' : 'var(--verified)', border: '2px solid var(--bg-card)' }}></div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: status === 'accepted' ? 'var(--warning)' : 'var(--text-main)' }}>Worker en route</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              {status === 'accepted' ? 'Currently broadcasting live GPS' : 'Arrived'}
            </div>
            {status === 'accepted' && !showFaceScanner && (
              userInfo?.role === 'household' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setScanType('checkin'); setShowFaceScanner(true); }}>
                    Verify Worker Arrival (Check-In)
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px' }} 
                    onClick={handleInstantCheckIn}
                    title="One-click demo checkin without camera"
                  >
                    ⚡ Demo: Skip to Job in Progress
                  </button>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', fontStyle: 'italic' }}>
                  Waiting for household to verify arrival...
                </div>
              )
            )}
          </div>

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', left: '-20px', width: '12px', height: '12px', borderRadius: '50%', background: status === 'in_progress' ? 'var(--primary)' : (status === 'completed' ? 'var(--verified)' : 'var(--line)'), border: '2px solid var(--bg-card)' }}></div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: status === 'in_progress' ? 'var(--primary)' : (status === 'completed' ? 'var(--text-main)' : 'var(--text-muted)') }}>Job in progress</div>
            {status !== 'completed' && !showFaceScanner && (
              userInfo?.role === 'household' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ background: 'var(--success)', border: 'none', fontWeight: 700 }} 
                    onClick={() => { setScanType('checkout'); setShowFaceScanner(true); }}
                  >
                    Verify Worker Checkout (Release Escrow)
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px' }} 
                    onClick={handleInstantCheckOut}
                    title="One-click demo checkout without camera"
                  >
                    ⚡ Demo: Instant Checkout & Release Escrow
                  </button>
                </div>
              ) : (
                status === 'in_progress' && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', fontStyle: 'italic' }}>
                    Waiting for household to verify checkout...
                  </div>
                )
              )
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-20px', width: '12px', height: '12px', borderRadius: '50%', background: status === 'completed' ? 'var(--verified)' : 'var(--line)', border: '2px solid var(--bg-card)' }}></div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: status === 'completed' ? 'var(--verified)' : 'var(--text-muted)' }}>Job completed & Escrow released</div>
          </div>
        </div>

        {/* Emergency SOS box matching PDF */}
        <div className="card" style={{ marginTop: 'auto', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '8px' }}>Emergency?</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>Alert local authorities and SkillConnect trust team instantly.</div>
          <button className="btn btn-danger btn-full btn-sm">SOS / Emergency</button>
        </div>
      </div>

      {/* Map Area or Review / Scanner */}
      <div className="tracking-map" style={{ display: 'flex', flexDirection: 'column' }}>
        {showFaceScanner ? (
          <div style={{ background: 'var(--bg-card)', height: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>{scanType === 'checkin' ? 'Check-In Verification' : 'Check-Out & Release Escrow'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFaceScanner(false)}>Cancel</button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please ask {workerName} to look into the camera to verify their identity.
            </p>
            <FaceScanner key={scanType} buttonText={scanType === 'checkin' ? "Verify Worker" : "Verify & Release Funds"} onScanComplete={handleFaceScan} />
          </div>
        ) : status === 'completed' ? (
          <div style={{ background: 'var(--bg-card)', height: '100%', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Job Completed Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The escrow funds have been released securely.</p>
            
            {!reviewSubmitted ? (
              <div className="card" style={{ width: '100%', maxWidth: '500px', border: '1px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="field">
                    <label>Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="input" value={reviewRating} onChange={e => setReviewRating(e.target.value)} required />
                  </div>
                  <div className="field" style={{ marginTop: '1rem' }}>
                    <label>Feedback</label>
                    <textarea className="input" rows="4" placeholder="How was the experience?" value={reviewComment} onChange={e => setReviewComment(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>Submit Review</button>
                </form>
              </div>
            ) : (
              <div className="badge badge-verified" style={{ padding: '1rem' }}>✓ Review submitted successfully! Thank you.</div>
            )}
          </div>
        ) : (
          <LiveMap workerName={workerName} bookingId={bookingId} workerId={workerId} />
        )}
      </div>

      <SOSButton bookingId={bookingId} userId={userInfo?._id} role={userInfo?.role} />

      <style>{`
        .tracking-layout {
          height: calc(100vh - 66px); /* Adjust based on navbar height */
          display: grid;
          grid-template-columns: 350px 1fr;
        }
        .tracking-sidebar {
          background: var(--bg-card);
          border-right: 1px solid var(--line);
          padding: 24px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .tracking-map {
          background: var(--line);
          position: relative;
        }
        /* Make LiveMap take full height */
        .tracking-map > div {
          height: 100% !important;
          width: 100% !important;
        }
        @media (max-width: 768px) {
          .tracking-layout {
            grid-template-columns: 1fr;
            height: auto;
            min-height: calc(100vh - 66px);
          }
          .tracking-map {
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default TrackingPage;
