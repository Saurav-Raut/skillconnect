import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Info, Phone, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LiveMap = ({ workerName = 'Worker', workerSkill = 'Professional', bookingId, workerId, workerInitialCoords, householdCoords }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Real street coordinates around Amaravati / Vijayawada / Thullur region (Household Destination)
  const homeCoords = householdCoords || [16.5190, 80.5180];
  
  const [distance, setDistance] = useState('...'); // km
  const [speed, setSpeed] = useState(0); // km/h
  const [eta, setEta] = useState('...'); // mins
  const [statusText, setStatusText] = useState('Waiting for worker location stream...');
  const [arrived, setArrived] = useState(false);

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); 
  };

  const animateMarker = (marker, startLatLng, endLatLng, durationMs = 3000) => {
    const startTime = performance.now();
    const animate = (time) => {
      let progress = (time - startTime) / durationMs;
      if (progress > 1) progress = 1;
      const currentLat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
      const currentLng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;
      marker.setLatLng([currentLat, currentLng]);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const getWorkerIcon = (name, skill, distText) => {
    return L.divIcon({
      className: 'tracking-worker-pin',
      html: `<div style="
        padding: 6px 14px; border-radius: 99px;
        background: #0f172a; color: white; display: flex;
        align-items: center; gap: 8px; font-size: 13px; font-weight: 800;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4); border: 2.5px solid #6366f1;
        white-space: nowrap;
      ">
        <span style="font-size: 18px;">🛵</span>
        <span>${name} • ${skill} • ${distText}</span>
      </div>`,
      iconSize: [220, 36],
      iconAnchor: [110, 18]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: homeCoords, // initial center

        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add Destination Household Marker
      const homeIcon = L.divIcon({
        className: 'tracking-home-pin',
        html: `<div style="
          width: 44px; height: 44px; border-radius: 50%;
          background: #22c55e; color: white; display: flex;
          align-items: center; justify-content: center; font-size: 24px;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.5); border: 3px solid #fff;
        ">🏠</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      L.marker(homeCoords, { icon: homeIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>Your Address</b><br/>Flat 4B, Amaravati Residency`);
      if (workerInitialCoords) {
        const initialDist = calculateDistanceKm(workerInitialCoords[0], workerInitialCoords[1], homeCoords[0], homeCoords[1]);
        const distStr = initialDist < 0.1 ? 'Arrived' : initialDist.toFixed(1) + ' km';
        
        const workerIcon = getWorkerIcon(workerName, workerSkill, distStr);
        
        markerRef.current = L.marker(workerInitialCoords, { icon: workerIcon })
          .addTo(mapRef.current)
          .bindTooltip(`
            <div style="font-weight: bold; font-size: 14px;">${workerName}</div>
            <div style="color: #64748b; font-size: 12px;">${workerSkill}</div>
            <div style="color: #16a34a; font-weight: 600; margin-top: 4px;">${distStr} away</div>
          `, { direction: 'top', offset: [0, -10] });
        
        // Fit bounds to show both markers
        const group = new L.featureGroup([L.marker(homeCoords), markerRef.current]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });

        setDistance(initialDist.toFixed(1));
        setEta(Math.max(1, Math.ceil(initialDist * 2.5)));
      }
    }

    return () => {
      // Map cleanup if unmounting handled by React
    };
  }, []);

  // Handle Real-Time GPS Tracking via Socket
  useEffect(() => {
    if (!window.socket) return;
    
    // Request joining the booking room to receive scoped location updates
    window.socket.emit('joinBooking', { bookingId, userId: 'household' });

    let lastCoords = null;
    let lastTime = Date.now();

    const handleLocationChange = (data) => {
      if (!data.coordinates || data.coordinates.length !== 2) return;
      
      const newLat = data.coordinates[1];
      const newLng = data.coordinates[0];
      const newCoord = [newLat, newLng];

      const dist = calculateDistanceKm(newLat, newLng, homeCoords[0], homeCoords[1]);
      const distStr = dist < 0.1 ? 'Arrived' : dist.toFixed(1) + ' km';
      const workerIcon = getWorkerIcon(workerName, workerSkill, distStr);

      if (!markerRef.current) {
        markerRef.current = L.marker(newCoord, { icon: workerIcon })
          .addTo(mapRef.current)
          .bindTooltip(`
            <div style="font-weight: bold; font-size: 14px;">${workerName}</div>
            <div style="color: #64748b; font-size: 12px;">${workerSkill}</div>
            <div style="color: #16a34a; font-weight: 600; margin-top: 4px;">${distStr} away</div>
          `, { direction: 'top', offset: [0, -10] });
        
        mapRef.current.panTo(newCoord, { animate: true, duration: 1 });
      } else {
        markerRef.current.setIcon(workerIcon);
        markerRef.current.setTooltipContent(`
            <div style="font-weight: bold; font-size: 14px;">${workerName}</div>
            <div style="color: #64748b; font-size: 12px;">${workerSkill}</div>
            <div style="color: #16a34a; font-weight: 600; margin-top: 4px;">${distStr} away</div>
        `);
        const startLatLng = markerRef.current.getLatLng();
        const endLatLng = L.latLng(newLat, newLng);
        animateMarker(markerRef.current, startLatLng, endLatLng, 3000);
        mapRef.current.panTo(endLatLng, { animate: true, duration: 1 });
      }

      // Calculate distance & ETA based on real coords
      setDistance(dist.toFixed(1));
      setEta(Math.max(1, Math.ceil(dist * 2.5))); // Approx ETA

      if (lastCoords) {
        // Calculate speed between points
        const timeDiffHours = (Date.now() - lastTime) / (1000 * 60 * 60);
        if (timeDiffHours > 0) {
          const traveled = calculateDistanceKm(lastCoords[0], lastCoords[1], newLat, newLng);
          const currentSpeed = (traveled / timeDiffHours);
          setSpeed(Math.min(100, Math.round(currentSpeed))); // Cap display speed to 100km/h
        }
      }

      if (dist < 0.1) {
        setArrived(true);
        setStatusText('Worker has arrived at your location!');
        setSpeed(0);
        setDistance(0);
        setEta(0);
      } else {
        setStatusText('Worker is heading to your location');
      }

      lastCoords = newCoord;
      lastTime = Date.now();
    };

    window.socket.on('locationChanged', handleLocationChange);
    
    return () => {
      window.socket.off('locationChanged', handleLocationChange);
    };
  }, [bookingId, workerName]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--line)', borderRadius: '20px', position: 'relative' }}>
      
      {/* Interactive OpenStreetMap Container */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '460px', 
          background: '#e2e8f0' 
        }} 
      />

      {/* Top Floating Telemetry Pill */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'var(--bg-card)',
        padding: '8px 16px',
        borderRadius: '999px',
        border: '1.5px solid var(--line)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 800,
        fontSize: '0.82rem',
        color: 'var(--text-main)'
      }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: arrived ? '#22c55e' : '#6366f1', display: 'inline-block', animation: !arrived ? 'pulse 1s infinite' : 'none' }}></span>
        <span>{arrived ? 'ARRIVED AT DESTINATION' : 'LIVE LIVEMATCH GPS TRACKING'}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>• OSM Free</span>
      </div>

      {/* Bottom Floating LiveMatch/Zomato Status Panel */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 1000,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--line)',
        borderRadius: '16px',
        padding: '18px 22px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>{workerName}</span>
            <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>Aadhaar Verified</span>
          </div>
          <div style={{ color: arrived ? 'var(--verified)' : 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={16} /> {statusText}
          </div>
        </div>

        {/* Real-time metrics: ETA, Distance, Speed */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ETA</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: arrived ? 'var(--verified)' : 'var(--primary)' }}>
              {eta} <span style={{ fontSize: '0.75rem' }}>MIN</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'var(--line)' }}></div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Distance</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {distance} <span style={{ fontSize: '0.75rem' }}>KM</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '36px', background: 'var(--line)' }}></div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Speed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              {speed} <span style={{ fontSize: '0.75rem' }}>KM/H</span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Emergency SOS */}
        <div style={{ display: 'flex', gap: '10px', flex: '0 0 auto' }}>
          <button 
            onClick={() => alert(`Calling ${workerName} at +91 98765 43210...`)}
            className="btn btn-primary" 
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Phone size={16} /> Call Driver
          </button>
          <button 
            onClick={() => alert('SOS Alert Triggered! Emergency safety team notified.')}
            className="btn btn-danger" 
            style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <ShieldAlert size={16} /> SOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
