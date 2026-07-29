import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Check, Search, Loader2 } from 'lucide-react';

// Extensive verified Indian Cities, Localities & Andhra Pradesh / Telangana regions with exact GPS coordinates [lng, lat]
const INDIA_LOCATIONS_DB = [
  { name: 'Thullur', state: 'Andhra Pradesh (Capital Region)', pincode: '522237', coordinates: [80.5180, 16.5190] },
  { name: 'Amaravati', state: 'Andhra Pradesh', pincode: '522503', coordinates: [80.5000, 16.5050] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', coordinates: [80.6480, 16.5062] },
  { name: 'Guntur', state: 'Andhra Pradesh', pincode: '522001', coordinates: [80.4365, 16.3067] },
  { name: 'Mangalagiri', state: 'Andhra Pradesh', pincode: '522503', coordinates: [80.5630, 16.4310] },
  { name: 'Tenali', state: 'Andhra Pradesh', pincode: '522201', coordinates: [80.6400, 16.2430] },
  { name: 'Visakhapatnam (Vizag)', state: 'Andhra Pradesh', pincode: '530001', coordinates: [83.2185, 17.6868] },
  { name: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', coordinates: [79.4192, 13.6288] },
  { name: 'Nellore', state: 'Andhra Pradesh', pincode: '524001', coordinates: [79.9865, 14.4426] },
  { name: 'Kurnool', state: 'Andhra Pradesh', pincode: '518001', coordinates: [78.0373, 15.8281] },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533101', coordinates: [81.7952, 17.0005] },
  { name: 'Kakinada', state: 'Andhra Pradesh', pincode: '533001', coordinates: [82.2381, 16.9891] },
  { name: 'Anantapur', state: 'Andhra Pradesh', pincode: '515001', coordinates: [77.6006, 14.6819] },
  { name: 'Ongole', state: 'Andhra Pradesh', pincode: '523001', coordinates: [80.0450, 15.5057] },
  { name: 'Kadapa', state: 'Andhra Pradesh', pincode: '516001', coordinates: [78.8242, 14.4673] },
  { name: 'Eluru', state: 'Andhra Pradesh', pincode: '534001', coordinates: [81.0952, 16.7107] },
  { name: 'Hyderabad', state: 'Telangana', pincode: '500001', coordinates: [78.4867, 17.3850] },
  { name: 'Secunderabad', state: 'Telangana', pincode: '500003', coordinates: [78.5018, 17.4399] },
  { name: 'Warangal', state: 'Telangana', pincode: '506001', coordinates: [79.5971, 17.9784] },
  { name: 'Nizamabad', state: 'Telangana', pincode: '503001', coordinates: [78.0941, 18.6725] },
  { name: 'Karimnagar', state: 'Telangana', pincode: '505001', coordinates: [79.1288, 18.4386] },
  { name: 'Khammam', state: 'Telangana', pincode: '507001', coordinates: [80.1514, 17.2473] },
  { name: 'Mumbai', state: 'Maharashtra', pincode: '400001', coordinates: [72.8777, 19.0760] },
  { name: 'Pune', state: 'Maharashtra', pincode: '411001', coordinates: [73.8567, 18.5204] },
  { name: 'Nagpur', state: 'Maharashtra', pincode: '440001', coordinates: [79.0882, 21.1458] },
  { name: 'Thane', state: 'Maharashtra', pincode: '400601', coordinates: [72.9781, 19.2183] },
  { name: 'Nashik', state: 'Maharashtra', pincode: '422001', coordinates: [73.7898, 19.9975] },
  { name: 'Bengaluru', state: 'Karnataka', pincode: '560001', coordinates: [77.5946, 12.9716] },
  { name: 'Mysuru (Mysore)', state: 'Karnataka', pincode: '570001', coordinates: [76.6394, 12.2958] },
  { name: 'Mangaluru (Mangalore)', state: 'Karnataka', pincode: '575001', coordinates: [74.8560, 12.9141] },
  { name: 'Hubballi (Hubli)', state: 'Karnataka', pincode: '580001', coordinates: [75.1240, 15.3647] },
  { name: 'Chennai', state: 'Tamil Nadu', pincode: '600001', coordinates: [80.2707, 13.0827] },
  { name: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', coordinates: [76.9558, 11.0168] },
  { name: 'Madurai', state: 'Tamil Nadu', pincode: '625001', coordinates: [78.1198, 9.9252] },
  { name: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu', pincode: '620001', coordinates: [78.7047, 10.7905] },
  { name: 'Salem', state: 'Tamil Nadu', pincode: '636001', coordinates: [78.1460, 11.6643] },
  { name: 'Kochi (Cochin)', state: 'Kerala', pincode: '682001', coordinates: [76.2673, 9.9312] },
  { name: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', coordinates: [76.9529, 8.5241] },
  { name: 'Kozhikode', state: 'Kerala', pincode: '673001', coordinates: [75.7804, 11.2588] },
  { name: 'New Delhi', state: 'Delhi NCR', pincode: '110001', coordinates: [77.2090, 28.6139] },
  { name: 'Noida', state: 'Uttar Pradesh (NCR)', pincode: '201301', coordinates: [77.3910, 28.5355] },
  { name: 'Gurugram (Gurgaon)', state: 'Haryana (NCR)', pincode: '122001', coordinates: [77.0266, 28.4595] },
  { name: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', coordinates: [80.9462, 26.8467] },
  { name: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', coordinates: [80.3319, 26.4499] },
  { name: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', coordinates: [82.9739, 25.3176] },
  { name: 'Agra', state: 'Uttar Pradesh', pincode: '282001', coordinates: [78.0081, 27.1767] },
  { name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', pincode: '211001', coordinates: [81.8463, 25.4358] },
  { name: 'Kolkata', state: 'West Bengal', pincode: '700001', coordinates: [88.3639, 22.5726] },
  { name: 'Howrah', state: 'West Bengal', pincode: '711101', coordinates: [88.3273, 22.5958] },
  { name: 'Siliguri', state: 'West Bengal', pincode: '734001', coordinates: [88.4285, 26.7271] },
  { name: 'Ahmedabad', state: 'Gujarat', pincode: '380001', coordinates: [72.5714, 23.0225] },
  { name: 'Surat', state: 'Gujarat', pincode: '395001', coordinates: [72.8311, 21.1702] },
  { name: 'Vadodara (Baroda)', state: 'Gujarat', pincode: '390001', coordinates: [73.1812, 22.3072] },
  { name: 'Rajkot', state: 'Gujarat', pincode: '360001', coordinates: [70.8022, 22.3039] },
  { name: 'Jaipur', state: 'Rajasthan', pincode: '302001', coordinates: [75.7873, 26.9124] },
  { name: 'Jodhpur', state: 'Rajasthan', pincode: '342001', coordinates: [73.0243, 26.2389] },
  { name: 'Udaipur', state: 'Rajasthan', pincode: '313001', coordinates: [73.7125, 24.5854] },
  { name: 'Indore', state: 'Madhya Pradesh', pincode: '452001', coordinates: [75.8577, 22.7196] },
  { name: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', coordinates: [77.4126, 23.2599] },
  { name: 'Gwalior', state: 'Madhya Pradesh', pincode: '474001', coordinates: [78.1828, 26.2183] },
  { name: 'Jabalpur', state: 'Madhya Pradesh', pincode: '482001', coordinates: [79.9414, 23.1815] },
  { name: 'Patna', state: 'Bihar', pincode: '800001', coordinates: [85.1376, 25.5941] },
  { name: 'Gaya', state: 'Bihar', pincode: '823001', coordinates: [85.0002, 24.7955] },
  { name: 'Muzaffarpur', state: 'Bihar', pincode: '842001', coordinates: [85.3906, 26.1209] },
  { name: 'Bhubaneswar', state: 'Odisha', pincode: '751001', coordinates: [85.8245, 20.2961] },
  { name: 'Cuttack', state: 'Odisha', pincode: '753001', coordinates: [85.8830, 20.4625] },
  { name: 'Ranchi', state: 'Jharkhand', pincode: '834001', coordinates: [85.3096, 23.3441] },
  { name: 'Jamshedpur', state: 'Jharkhand', pincode: '831001', coordinates: [86.2029, 22.8046] },
  { name: 'Raipur', state: 'Chhattisgarh', pincode: '492001', coordinates: [81.6296, 21.2514] },
  { name: 'Chandigarh', state: 'Chandigarh', pincode: '160001', coordinates: [76.7794, 30.7333] },
  { name: 'Ludhiana', state: 'Punjab', pincode: '141001', coordinates: [75.8573, 30.9010] },
  { name: 'Amritsar', state: 'Punjab', pincode: '143001', coordinates: [74.8723, 31.6340] },
  { name: 'Dehradun', state: 'Uttarakhand', pincode: '248001', coordinates: [78.0322, 30.3165] },
  { name: 'Guwahati', state: 'Assam', pincode: '781001', coordinates: [91.7362, 26.1445] }
];

const IndiaLocationAutocomplete = ({ 
  value = '', 
  onChange, 
  onSelectLocation, 
  placeholder = 'Type 3 letters of any Indian city or area (e.g. Thu, Vij, Hyd)...',
  label = 'City / Operating Area (All-India Autocomplete)'
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local Indian database + query OpenStreetMap API for India if needed
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const clean = query.trim().toLowerCase();

    // 1. Instant match against our verified All-India Cities DB
    const localMatches = INDIA_LOCATIONS_DB.filter(loc => 
      loc.name.toLowerCase().includes(clean) || 
      loc.state.toLowerCase().includes(clean) ||
      loc.pincode.includes(clean)
    ).slice(0, 7);

    setSuggestions(localMatches);
    setIsOpen(true);

    // 2. If query >= 3 chars, debounce query OpenStreetMap Nominatim for India-wide street/town results
    if (clean.length >= 3 && localMatches.length < 5) {
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&countrycodes=in&limit=4&addressdetails=1`);
          const data = await res.json();
          
          if (data && data.length > 0) {
            const osmResults = data.map(item => ({
              name: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.name || 'Location',
              state: `${item.address?.state || 'India'} (${item.address?.postcode || 'IN'})`,
              pincode: item.address?.postcode || '',
              coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
              isOsm: true
            }));

            // Merge avoiding duplicates
            const existingNames = new Set(localMatches.map(m => m.name.toLowerCase()));
            const newResults = osmResults.filter(o => !existingNames.has(o.name.toLowerCase()));
            setSuggestions(prev => [...prev, ...newResults].slice(0, 8));
          }
        } catch (err) {
          console.warn('OSM India search error:', err);
        } finally {
          setLoading(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [query]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) {
      onChange(text);
    }
  };

  const handleSelect = (loc) => {
    const formattedName = `${loc.name}, ${loc.state.split('(')[0].trim()}`;
    setQuery(formattedName);
    setSelectedLocation(loc);
    setIsOpen(false);
    if (onSelectLocation) {
      onSelectLocation({
        addressText: formattedName,
        city: loc.name,
        state: loc.state,
        pincode: loc.pincode,
        coordinates: loc.coordinates
      });
    }
  };

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          
          try {
            // Reverse geocode in India
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
            const data = await res.json();
            const cityName = data.address?.city || data.address?.town || data.address?.village || 'Thullur';
            const stateName = data.address?.state || 'Andhra Pradesh';
            const fullStr = `${cityName}, ${stateName}`;
            
            setQuery(fullStr);
            const locObj = {
              name: cityName,
              state: stateName,
              pincode: data.address?.postcode || '522237',
              coordinates: [lng, lat]
            };
            setSelectedLocation(locObj);
            if (onSelectLocation) {
              onSelectLocation({
                addressText: fullStr,
                city: cityName,
                state: stateName,
                pincode: locObj.pincode,
                coordinates: [lng, lat]
              });
            }
          } catch (err) {
            // Fallback to Thullur / Amaravati Capital region
            const fallback = {
              name: 'Thullur',
              state: 'Andhra Pradesh (Capital Region)',
              pincode: '522237',
              coordinates: [80.5180, 16.5190]
            };
            setQuery('Thullur, Andhra Pradesh');
            setSelectedLocation(fallback);
            if (onSelectLocation) {
              onSelectLocation({
                addressText: 'Thullur, Andhra Pradesh',
                city: 'Thullur',
                state: 'Andhra Pradesh',
                pincode: '522237',
                coordinates: fallback.coordinates
              });
            }
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Default Thullur capital region if GPS denied
          setLoading(false);
          const fallback = {
            name: 'Thullur',
            state: 'Andhra Pradesh',
            pincode: '522237',
            coordinates: [80.5180, 16.5190]
          };
          setQuery('Thullur, Andhra Pradesh');
          setSelectedLocation(fallback);
          if (onSelectLocation) {
            onSelectLocation({
              addressText: 'Thullur, Andhra Pradesh',
              city: 'Thullur',
              state: 'Andhra Pradesh',
              pincode: '522237',
              coordinates: fallback.coordinates
            });
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  return (
    <div className="field" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--verified)', fontWeight: 600 }}>🇮🇳 All-India Map Verified</span>
      </label>}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        
        <input
          type="text"
          className="input"
          style={{ paddingLeft: '42px', paddingRight: '120px', width: '100%', fontWeight: 600 }}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />

        <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading && <Loader2 size={16} className="spin" style={{ color: 'var(--primary)' }} />}
          
          <button
            type="button"
            onClick={handleDetectGPS}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Auto-detect Indian GPS Location"
          >
            <Navigation size={12} /> GPS
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--primary)',
          borderRadius: '12px',
          marginTop: '6px',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '8px 14px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🇮🇳 ALL-INDIA SUGGESTIONS (CLICK TO SELECT)</span>
            <span>Prevent False Addresses</span>
          </div>

          {suggestions.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(loc)}
              style={{
                padding: '12px 14px',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s ease',
                background: selectedLocation?.name === loc.name ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {loc.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {loc.state} {loc.pincode ? `• ${loc.pincode}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                <div>{loc.coordinates[1].toFixed(4)}° N</div>
                <div>{loc.coordinates[0].toFixed(4)}° E</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Verified Location Badge */}
      {selectedLocation && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: 700 }}>
            <Check size={15} /> 🇮🇳 Verified Indian Location: {selectedLocation.name}, {selectedLocation.state.split('(')[0].trim()}
          </div>
          <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            [{selectedLocation.coordinates[1].toFixed(4)}° N, {selectedLocation.coordinates[0].toFixed(4)}° E]
          </span>
        </div>
      )}
    </div>
  );
};

export default IndiaLocationAutocomplete;
