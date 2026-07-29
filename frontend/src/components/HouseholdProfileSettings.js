import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, MapPin, Shield, User, Camera, Trash2, Save } from 'lucide-react';
import IndiaLocationAutocomplete from './IndiaLocationAutocomplete';

const HouseholdProfileSettings = ({ userInfo }) => {
  const [avatarStr, setAvatarStr] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const fileInputRef = useRef(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userInfo?._id) {
      const savedAvatar = localStorage.getItem(`avatar_${userInfo._id}`);
      if (savedAvatar) setAvatarStr(savedAvatar);
      
      const savedAddress = localStorage.getItem(`address_${userInfo._id}`);
      if (savedAddress) setAddress(savedAddress);
      
      const savedCity = localStorage.getItem(`city_${userInfo._id}`);
      if (savedCity) setCity(savedCity);
    }
  }, [userInfo]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarStr(reader.result);
        if (userInfo?._id) {
          localStorage.setItem(`avatar_${userInfo._id}`, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarDelete = (e) => {
    e.stopPropagation();
    setAvatarStr(null);
    if (userInfo?._id) {
      localStorage.removeItem(`avatar_${userInfo._id}`);
    }
  };

  const handleSaveAddress = () => {
    if (userInfo?._id) {
      localStorage.setItem(`address_${userInfo._id}`, address);
      localStorage.setItem(`city_${userInfo._id}`, city);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '32px' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: '120px', height: '120px', borderRadius: '50%', background: 'var(--color-primary)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            fontSize: '3rem', color: 'var(--bg-card)', position: 'relative', cursor: 'pointer',
            backgroundImage: avatarStr ? `url(${avatarStr})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '4px solid var(--bg-card)'
          }}
          title="Click to upload profile photo"
        >
          {!avatarStr && <div style={{ marginTop: '10px' }}>{userInfo?.name?.charAt(0).toUpperCase() || 'H'}</div>}
          {!avatarStr && <div style={{ position: 'absolute', bottom: '15px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}><Camera size={16} /></div>}
          {avatarStr && (
            <div 
              onClick={handleAvatarDelete}
              style={{
                position: 'absolute', top: '0px', right: '0px', background: 'var(--danger)', color: 'white',
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              title="Remove image"
            >
              <Trash2 size={14} />
            </div>
          )}
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
        
        <div>
          <div className="heading" style={{ fontSize: '2rem', marginBottom: '4px' }}>{userInfo?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Household Member</span>
            <span>·</span>
            <span>ID: {userInfo?._id?.substring(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {userInfo?.phone || 'No phone added'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} color="var(--success)" /> Verified Account</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Address & Location */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1.2rem' }}>
            <MapPin color="var(--primary)" /> Service Address
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            This is the default address where workers will be dispatched to when you make a booking.
          </p>
          
          <div className="field">
            <label>Street Address</label>
            <input 
              className="input" 
              type="text" 
              placeholder="e.g. 123 Main St, Apt 4B" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          <IndiaLocationAutocomplete
            value={city}
            onChange={(text) => setCity(text)}
            onSelectLocation={(loc) => {
              setCity(loc.addressText);
              if (userInfo?._id) {
                localStorage.setItem(`coords_${userInfo._id}`, JSON.stringify(loc.coordinates));
              }
            }}
            placeholder="Type 2-3 letters of any Indian city/area (e.g. Thu, Vij, Hyd)..."
            label="City / Region (All-India Autocomplete)"
          />

          <button onClick={handleSaveAddress} className="btn btn-primary" style={{ marginTop: '8px' }}>
            <Save size={18} style={{ marginRight: '6px' }} /> {saved ? 'Saved!' : 'Save Address'}
          </button>
        </div>

        {/* Billing & Payment */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1.2rem' }}>
            <CreditCard color="var(--accent)" /> Payment Methods
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Manage your saved cards for escrow deposits and quick checkout.
          </p>
          
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '32px', background: 'var(--color-darkest)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontStyle: 'italic', fontSize: '0.8rem' }}>
                VISA
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>•••• •••• •••• 4242</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Expires 12/28</div>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>Default</span>
          </div>

          <button className="btn btn-ghost btn-full" style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
            + Add New Payment Method
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default HouseholdProfileSettings;
