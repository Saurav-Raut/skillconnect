import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WorkerMapView = ({ workers = [], center = [16.5186, 80.5158] }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  const markersRef = useRef({});

  // Use real GPS coordinates [lat, lng]. MongoDB stores as [lng, lat]
  const getWorkerCoords = (worker) => {
    if (worker.currentLocation && worker.currentLocation.coordinates && worker.currentLocation.coordinates.length === 2) {
      return [worker.currentLocation.coordinates[1], worker.currentLocation.coordinates[0]];
    }
    // Fallback if no location somehow
    return [center[0], center[1]];
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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: center,
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

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
        .bindPopup(`<b style="font-size: 14px;">Your Location</b><br/><span style="color: #64748b;">Search Center</span>`);
    }

    // Keep track of which workers are currently rendered
    const currentWorkerIds = new Set(workers.map(w => w._id));
    
    // Remove markers for workers that are no longer in the list (went offline)
    Object.keys(markersRef.current).forEach(id => {
      if (!currentWorkerIds.has(id)) {
        mapRef.current.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add or update Worker Marker Pins
    workers.forEach((worker) => {
      const coords = getWorkerCoords(worker);
      
      if (markersRef.current[worker._id]) {
         // If marker already exists, don't recreate it. The socket listener handles animation.
         // But if the parent re-rendered because of a big list update, we could update it here.
         return; 
      }

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
        navigate(`/booking?workerId=${worker._id}`);
      };
      popupContent.appendChild(bookBtn);

      const marker = L.marker(coords, { icon: workerIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent);
        
      markersRef.current[worker._id] = marker;
    });

  }, [workers, center, navigate]);

  // Handle Live Real-Time Socket Updates for existing markers
  useEffect(() => {
    if (!window.socket) return;

    const handleLocationUpdate = (data) => {
      // data.workerId, data.coordinates = [lng, lat]
      const marker = markersRef.current[data.workerId];
      if (marker && data.coordinates && data.coordinates.length === 2) {
        const startLatLng = marker.getLatLng();
        const endLatLng = L.latLng(data.coordinates[1], data.coordinates[0]);
        // Smoothly animate over 3 seconds (rate limit interval)
        animateMarker(marker, startLatLng, endLatLng, 3000);
      }
    };

    window.socket.on('locationChanged', handleLocationUpdate);
    
    return () => {
      window.socket.off('locationChanged', handleLocationUpdate);
    };
  }, []);

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
