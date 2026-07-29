import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WorkerMapView = ({ workers = [], center = [16.5186, 80.5158] }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  // Assign simulated or real GPS coordinates around Amaravati/Thullur to workers for realistic map pins
  const getWorkerCoords = (worker, idx) => {
    if (worker.coordinates && worker.coordinates.length === 2) {
      return worker.coordinates;
    }
    // Spread markers realistically across Amaravati / Vijayawada / Guntur area
    const baseLat = center[0];
    const baseLng = center[1];
    const offsets = [
      [0.012, 0.008],
      [-0.015, 0.018],
      [0.025, -0.012],
      [-0.008, -0.022],
      [0.018, 0.025],
      [-0.028, 0.005],
      [0.005, -0.035],
      [-0.018, -0.015]
    ];
    const offset = offsets[idx % offsets.length];
    return [baseLat + offset[0], baseLng + offset[1]];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: center,
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Add 100% free OpenStreetMap tile layer (No paid API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }

    // Clear existing layer groups if re-rendering markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Popup) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add Household Center Marker
    const homeIcon = L.divIcon({
      className: 'custom-home-pin',
      html: `<div style="
        width: 38px; height: 38px; border-radius: 50%;
        background: #22c55e; color: white; display: flex;
        align-items: center; justify-content: center; font-size: 20px;
        box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); border: 3px solid #fff;
        font-weight: bold;
      ">🏠</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    L.marker(center, { icon: homeIcon })
      .addTo(mapRef.current)
      .bindPopup(`<b style="font-size: 14px;">Your Location</b><br/><span style="color: #64748b;">Amaravati / Thullur Region</span>`);

    // Add Worker Marker Pins
    workers.forEach((worker, index) => {
      const coords = getWorkerCoords(worker, index);
      const name = worker.user?.name || 'Skilled Worker';
      const skill = worker.skill || 'Professional';
      const rate = worker.ratePerHour ? `₹${worker.ratePerHour * 8}/day` : '₹800/day';
      const rating = worker.ratingAvg || 4.8;
      const idStatus = worker.idVerificationStatus === 'approved';

      const workerIcon = L.divIcon({
        className: 'custom-worker-pin',
        html: `<div style="
          padding: 4px 10px; border-radius: 99px;
          background: #6366f1; color: white; display: flex;
          align-items: center; gap: 6px; font-size: 12px; font-weight: 700;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); border: 2px solid #fff;
          white-space: nowrap; cursor: pointer;
        ">
          <span>${skill}</span>
          <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 10px;">★ ${rating}</span>
        </div>`,
        iconSize: [120, 32],
        iconAnchor: [60, 16]
      });

      const popupContent = document.createElement('div');
      popupContent.style.padding = '4px';
      popupContent.style.textAlign = 'center';
      popupContent.style.minWidth = '180px';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 15px; color: #0f172a; margin-bottom: 2px;">${name}</div>
        <div style="color: #475569; font-size: 12px; margin-bottom: 6px;">${skill} ${idStatus ? '✓ Verified' : ''}</div>
        <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 10px;">
          <span style="font-weight: 700; color: #16a34a; font-size: 14px;">${rate}</span>
          <span style="color: #64748b; font-size: 12px;"> • ★ ${rating} (14 reviews)</span>
        </div>
      `;

      const bookBtn = document.createElement('button');
      bookBtn.innerText = 'Book Now';
      bookBtn.style.cssText = `
        width: 100%; padding: 8px 12px; background: #6366f1; color: white;
        border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
        font-size: 13px;
      `;
      bookBtn.onclick = () => {
        navigate(`/booking?workerId=${worker._id || index + 1}`);
      };

      popupContent.appendChild(bookBtn);

      L.marker(coords, { icon: workerIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent);
    });

  }, [workers, center, navigate]);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid var(--line)', borderRadius: '16px', position: 'relative' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '520px', 
          background: '#e2e8f0' 
        }} 
      />
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        background: 'var(--bg-card)',
        padding: '8px 14px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid var(--line)',
        fontSize: '0.8rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
        Live OpenStreetMap (100% Free API)
      </div>
    </div>
  );
};

export default WorkerMapView;
