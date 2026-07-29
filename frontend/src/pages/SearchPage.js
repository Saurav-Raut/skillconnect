import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkers } from '../redux/workerSlice';
import WorkerCard from '../components/WorkerCard';
import WorkerMapView from '../components/WorkerMapView';
import { SKILL_CATEGORIES } from '../utils/constants';
import { Map, Grid, Filter, RotateCcw } from 'lucide-react';
import IndiaLocationAutocomplete from '../components/IndiaLocationAutocomplete';
import RapidoMatchingModal from '../components/RapidoMatchingModal';
import LiveMap from '../components/LiveMap';

const SearchPage = () => {
  const dispatch = useDispatch();
  const { workersList, loading, error } = useSelector((state) => state.worker);
  const { userInfo } = useSelector((state) => state.user);

  const [skill, setSkill] = useState('');
  const [rating, setRating] = useState('4+');
  const [locationStr, setLocationStr] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Rapido live matching state
  const [isRapidoOpen, setIsRapidoOpen] = useState(false);
  const [activeRapidoBookingId, setActiveRapidoBookingId] = useState('');
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [liveMapBookingId, setLiveMapBookingId] = useState(null);
  const [liveMapWorker, setLiveMapWorker] = useState(null);

  const startRapidoBroadcast = () => {
    const newBid = '64010a1b2c3d4e5f60718293';
    setActiveRapidoBookingId(newBid);
    setIsRapidoOpen(true);

    if (window.socket) {
      window.socket.emit('startRapidoMatch', {
        bookingId: newBid,
        skill: skill && skill !== 'All' ? skill : 'Electrician',
        coordinates: [80.5180, 16.5190],
        addressText: locationStr || 'Thullur, Amaravati, AP',
        radiusKm: 5,
        householdName: userInfo?.name || 'Household Customer',
        ratePerHour: 150,
        totalAmount: 300
      });
    }
  };

  const handleSearch = () => {
    const filters = {};
    if (skill && skill !== 'All') filters.skill = skill;
    dispatch(fetchWorkers(filters));
  };

  useEffect(() => {
    handleSearch();
  }, [dispatch]);

  const fallbackWorkers = [
    { _id: '1', user: { name: 'Ravi Kumar' }, skill: 'Electrician', ratePerHour: 100, ratingAvg: 4.8, city: 'Thullur, AP', idVerificationStatus: 'approved' },
    { _id: '2', user: { name: 'Suresh Naidu' }, skill: 'Plumber', ratePerHour: 93.75, ratingAvg: 4.9, city: 'Vijayawada', idVerificationStatus: 'approved' },
    { _id: '3', user: { name: 'Lakshmi Devi' }, skill: 'Cleaner', ratePerHour: 62.5, ratingAvg: 4.7, city: 'Guntur', idVerificationStatus: 'approved' },
    { _id: '4', user: { name: 'Anitha K.' }, skill: 'Cook', ratePerHour: 75, ratingAvg: 4.6, city: 'Thullur', idVerificationStatus: 'approved' },
    { _id: '5', user: { name: 'Mohan Rao' }, skill: 'Carpenter', ratePerHour: 112.5, ratingAvg: 4.9, city: 'Vijayawada', idVerificationStatus: 'approved' },
    { _id: '6', user: { name: 'Ganesh P.' }, skill: 'Daily labour', ratePerHour: 56.25, ratingAvg: 4.5, city: 'Guntur', idVerificationStatus: 'approved' }
  ];

  const displayWorkers = workersList.length > 0 ? workersList : fallbackWorkers;

  return (
    <div className="fade-in search-layout" style={{
      maxWidth: '1280px', margin: '0 auto', padding: '36px 6vw 80px',
      display: 'flex', flexDirection: 'column', gap: '30px'
    }}>
      
      <aside>
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', padding: '20px' }}>
          
          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Skill</label>
            <div className="select-pill-group">
              {['All', ...SKILL_CATEGORIES.slice(0,4), 'Cleaner'].map((s) => (
                <div 
                  key={s}
                  onClick={() => setSkill(s)}
                  className={`select-pill ${skill === s || (s === 'All' && !skill) ? 'active' : ''}`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <IndiaLocationAutocomplete
              value={locationStr}
              onChange={(text) => setLocationStr(text)}
              onSelectLocation={(loc) => setLocationStr(loc.city)}
              placeholder="Type 2-3 letters of any Indian city..."
              label="Locality / City (All-India)"
            />
          </div>

          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Price range (₹/day)</label>
            <div style={{ display: 'flex', gap: '14px' }}>
              <input className="input" placeholder="Min" />
              <input className="input" placeholder="Max" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Minimum rating</label>
            <div className="select-pill-group">
              {['3+', '4+', '4.5+'].map(r => (
                <div 
                  key={r}
                  onClick={() => setRating(r)}
                  className={`select-pill ${rating === r ? 'active' : ''}`}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSearch} className="btn btn-ghost" style={{ padding: '10px 20px', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={16} /> Reset filters
          </button>
        </div>
      </aside>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="heading" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              {displayWorkers.length} verified workers {locationStr ? `near ${locationStr}` : 'available'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              100% ID-checked professionals ready for booking
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Rapido Instant Broadcast Button */}
            <button
              onClick={startRapidoBroadcast}
              style={{
                padding: '9px 18px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
              }}
            >
              ⚡ Rapido Live Match
            </button>

            {/* Map vs List View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--line)',
              borderRadius: '999px',
              padding: '4px'
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: '0.15s'
                }}
              >
                <Grid size={16} /> Grid List
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'map' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: '0.15s'
                }}
              >
                <Map size={16} /> Map View
              </button>
            </div>

            <select className="input" style={{ width: 'auto', borderRadius: '999px', padding: '10px 18px' }}>
              <option>Sort: Highest rated</option>
              <option>Sort: Price — low to high</option>
              <option>Sort: Nearest</option>
            </select>
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Searching workers...</div>
        ) : viewMode === 'map' ? (
          <WorkerMapView workers={displayWorkers} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="worker-grid">
            {displayWorkers.map((w) => (
              <WorkerCard key={w._id} worker={w} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .worker-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .select-pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .select-pill { padding: 9px 15px; border-radius: 999px; border: 1.5px solid var(--line); font-size: 0.82rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.15s; background: rgba(0,0,0,0.15); }
        .select-pill.active { background: var(--primary); color: #FFF; border-color: var(--primary); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
      `}</style>

      {/* RAPIDO MATCHING MODAL */}
      <RapidoMatchingModal
        isOpen={isRapidoOpen}
        onClose={() => setIsRapidoOpen(false)}
        bookingId={activeRapidoBookingId}
        skillRequested={skill && skill !== 'All' ? skill : 'Electrician'}
        radiusKm={5}
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
          workerSkill={liveMapWorker?.skill || skill || 'Electrician'}
          workerRating={liveMapWorker?.ratingAvg || 5.0}
        />
      )}

    </div>
  );
};

export default SearchPage;
