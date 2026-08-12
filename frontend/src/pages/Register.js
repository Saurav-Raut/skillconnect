import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, verifyOTPCode, clearError } from '../redux/userSlice';
import { SKILL_CATEGORIES } from '../utils/constants';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, loading, error, otpSuccess } = useSelector((state) => state.user);

  // Role toggle
  const [role, setRole] = useState('household'); // household, worker

  // Auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Household fields
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');

  // Worker fields
  const [skill, setSkill] = useState(SKILL_CATEGORIES[0] || 'Electrician');
  const [pricePerDay, setPricePerDay] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  // OTP Verification state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo && !showOtpScreen) {
      setShowOtpScreen(true);
    }
  }, [userInfo, showOtpScreen]);

  useEffect(() => {
    if (otpSuccess) {
      if (userInfo?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [otpSuccess, userInfo, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      email: role === 'household' ? (email || `${phone}@temp.com`) : `${phone}@temp.com`,
      phone,
      password: password || 'defaultPass123', // if password isn't in UI, give default
      role
    };

    if (role === 'household') {
      payload.address = address;
      payload.city = locality;
    } else {
      payload.skill = skill;
      payload.experience = 1; // default since PDF doesn't have it
      payload.ratePerHour = parseInt(pricePerDay) / 8 || 100;
      payload.bio = '';
    }

    dispatch(registerUser(payload));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    dispatch(verifyOTPCode(otpCode));
  };

  if (showOtpScreen) {
    return (
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '64px 6vw 90px' }}>
        <div className="badge badge-verified" style={{ marginBottom: '16px' }}>Step 2 of 2</div>
        <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '16px' }}>Verify your phone</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>We've sent a 6-digit code to {phone}.</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}

        <div className="card">
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label>Enter OTP</label>
              <input 
                className="input" 
                maxLength="6" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)} 
                style={{ letterSpacing: '0.5em', fontSize: '1.2rem', textAlign: 'center' }}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: role === 'household' ? '620px' : '680px', margin: '0 auto', padding: '64px 6vw 90px' }}>
      
      {role === 'household' ? (
        <>
          <div className="badge badge-verified" style={{ marginBottom: '16px' }}>Step 1 of 2</div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '16px' }}>Create your household account</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Takes about 2 minutes. You'll verify your phone before booking your first worker.</p>
        </>
      ) : (
        <>
          <div className="badge badge-pending" style={{ marginBottom: '16px' }}>Step 1 of 3 — Basic details</div>
          <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '16px' }}>Join as a verified worker</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Every worker is ID-checked and face-verified before their first job — it's what keeps households booking with confidence.</p>
        </>
      )}

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}

      <div className="select-pill-group" style={{ marginBottom: '24px' }}>
        <div 
          className={`select-pill ${role === 'household' ? 'active' : ''}`}
          onClick={() => setRole('household')}
        >
          Household
        </div>
        <div 
          className={`select-pill ${role === 'worker' ? 'active' : ''}`}
          onClick={() => setRole('worker')}
        >
          Worker
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          
          {role === 'household' ? (
            <>
              <div className="field">
                <label>Full name</label>
                <input className="input" placeholder="e.g. Priya Reddy" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
              
              <div className="input-row">
                <div className="field">
                  <label>Phone number</label>
                  <input className="input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Email <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Set Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>

              <div className="field" style={{ marginTop: '24px' }}>
                <label>Home address</label>
                <input className="input" placeholder="House / street" style={{ marginBottom: '10px' }} value={address} onChange={(e)=>setAddress(e.target.value)} required />
                <div className="input-row">
                  <input className="input" placeholder="Locality" value={locality} onChange={(e)=>setLocality(e.target.value)} required />
                  <input className="input" placeholder="Pincode" value={pincode} onChange={(e)=>setPincode(e.target.value)} required />
                </div>
              </div>


            </>
          ) : (
            <>
              <div className="input-row">
                <div className="field">
                  <label>Full name</label>
                  <input className="input" placeholder="e.g. Ravi Kumar" value={name} onChange={(e)=>setName(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input className="input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
                </div>
              </div>
              
              <div className="field">
                <label>Set Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>

              <div className="field" style={{ marginTop: '24px' }}>
                <label>Trade / skill</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Electrician', 'Plumber', 'Carpenter', 'Cook', 'Cleaner', 'Daily Laborer'].map(s => (
                    <div 
                      key={s} 
                      onClick={() => setSkill(s)}
                      className="badge" 
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px 14px',
                        background: skill === s ? 'var(--color-darkest)' : 'transparent',
                        color: skill === s ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${skill === s ? 'var(--color-darkest)' : 'var(--line-dark)'}`
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-row" style={{ marginTop: '24px' }}>
                <div className="field">
                  <label>Service area / locality</label>
                  <input className="input" placeholder="e.g. Thullur, Guntur Dt." value={serviceArea} onChange={(e)=>setServiceArea(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Price per day (₹)</label>
                  <input className="input" type="number" placeholder="800" value={pricePerDay} onChange={(e)=>setPricePerDay(e.target.value)} required />
                </div>
              </div>

              <div className="field" style={{ marginTop: '24px' }}>
                <label>Government ID</label>
                <div style={{
                  border: '1.5px dashed var(--line-dark)', borderRadius: 'var(--radius-md)', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: '0.15s'
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>⬆</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Aadhaar / Voter ID / Driving Licence</div>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '4px' }}>PDF or image, under 5 MB</div>
                </div>
              </div>

              <div className="field" style={{ marginTop: '24px' }}>
                <label>Profile photo <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(used for face verification)</span></label>
                <div style={{
                  border: '1.5px dashed var(--line-dark)', borderRadius: 'var(--radius-md)', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: '0.15s'
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.1rem' }}>📷</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Take or upload a clear front-facing photo</div>
                </div>
              </div>

              <div className="field" style={{ marginTop: '24px' }}>
                <label>Available days</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="badge" style={{ cursor: 'pointer', background: ['Mon','Tue','Wed','Thu','Fri'].includes(d) ? 'var(--color-darkest)' : 'transparent', color: ['Mon','Tue','Wed','Thu','Fri'].includes(d) ? 'white' : 'var(--text-muted)', border: '1px solid var(--line-dark)', padding: '8px 14px' }}>{d}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Processing...' : (role === 'household' ? 'Create account →' : 'Submit for verification →')}
          </button>
          
          <p style={{ fontSize: '0.76rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '14px' }}>
            {role === 'household' 
              ? "By continuing you agree to SkillConnect's Terms and Safety Policy."
              : "Verification usually takes 24–48 hours. We'll notify you once approved."}
          </p>
        </form>
      </div>

      <style>{`
        .select-pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .select-pill { padding: 9px 15px; border-radius: 999px; border: 1.5px solid var(--line); font-size: 0.82rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.15s; background: rgba(0,0,0,0.15); }
        .select-pill.active { background: var(--primary); color: #FFF; border-color: var(--primary); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
      `}</style>
    </div>
  );
};

export default Register;
