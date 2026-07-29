import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Info, Phone, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LiveMap = ({ workerName = 'Karthik Reddy', bookingId = 'SK8291', workerId }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // Real street coordinates around Amaravati / Vijayawada / Thullur region
  const homeCoords = [16.5190, 80.5180];
  
  // Waypoints along a real street route to simulate GPS driving/riding
  const routeWaypoints = [
    [16.5020, 80.4990],
    [16.5060, 80.5030],
    [16.5100, 80.5080],
    [16.5140, 80.5130],
    [16.5170, 80.5160],
    [16.5190, 80.5180]
  ];

  const [waypointIndex, setWaypointIndex] = useState(0);
  const [distance, setDistance] = useState(3.4); // km
  const [speed, setSpeed] = useState(26); // km/h
  const [eta, setEta] = useState(12); // mins
  const [statusText, setStatusText] = useState('Worker is riding toward your location on Secretariat Road');
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [16.5110, 80.5090],
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

      // Add Polyline Route Line
      polylineRef.current = L.polyline(routeWaypoints, {
        color: '#6366f1',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 8'
      }).addTo(mapRef.current);
    }

    return () => {
      // Map cleanup if unmounting
    };
  }, []);

  // Update Worker Marker as waypoint progresses
  useEffect(() => {
    if (!mapRef.current) return;

    const currentCoord = routeWaypoints[waypointIndex];

    const workerIcon = L.divIcon({
      className: 'tracking-worker-pin',
      html: `<div style="
        padding: 6px 14px; border-radius: 99px;
        background: #0f172a; color: white; display: flex;
        align-items: center; gap: 8px; font-size: 13px; font-weight: 800;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4); border: 2.5px solid #6366f1;
        white-space: nowrap;
      ">
        <span style="font-size: 18px;">🛵</span>
        <span>${workerName}</span>
      </div>`,
      iconSize: [160, 36],
      iconAnchor: [80, 18]
    });

    if (!markerRef.current) {
      markerRef.current = L.marker(currentCoord, { icon: workerIcon }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(currentCoord);
      markerRef.current.setIcon(workerIcon);
    }

    // Smoothly pan map toward moving worker
    mapRef.current.panTo(currentCoord, { animate: true, duration: 1 });

  }, [waypointIndex, workerName]);

  // GPS Movement Simulation Interval (Rapido Style)
  useEffect(() => {
    const interval = setInterval(() => {
      setWaypointIndex((prev) => {
        if (prev >= routeWaypoints.length - 1) {
          clearInterval(interval);
          setDistance(0);
          setEta(0);
          setSpeed(0);
          setStatusText('Worker has arrived at your location!');
          setArrived(true);
          return prev;
        }

        const nextIdx = prev + 1;
        const remaining = (routeWaypoints.length - 1 - nextIdx);
        const newDist = (remaining * 0.7).toFixed(1);
        setDistance(newDist);
        setEta(Math.max(1, remaining * 2));
        setSpeed(remaining === 0 ? 0 : 22 + Math.floor(Math.random() * 8));

        if (remaining === 1) {
          setStatusText('Worker is turning into your street...');
        }

        // Emit socket coordinates if live
        if (window.socket && workerId) {
          window.socket.emit('updateLocation', {
            workerId,
            bookingId,
            coordinates: routeWaypoints[nextIdx]
          });
        }

        return nextIdx;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [bookingId, workerId]);

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
        <span>{arrived ? 'ARRIVED AT DESTINATION' : 'LIVE RAPIDO GPS TRACKING'}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>• OSM Free</span>
      </div>

      {/* Bottom Floating Rapido/Zomato Status Panel */}
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
