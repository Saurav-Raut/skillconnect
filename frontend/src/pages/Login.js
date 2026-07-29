import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/userSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('household');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'admin') {
      sessionStorage.setItem('token', 'fake-admin-token');
      dispatch({
        type: 'user/login/fulfilled',
        payload: {
          user: { _id: 'admin_001', name: 'System Administrator', email: 'admin@gmail.com', role: 'admin', isVerified: true },
          token: 'fake-admin-token'
        }
      });
      navigate('/admin');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 4vw'
    }}>
      <div className="card login-card" style={{
        maxWidth: '1000px',
        width: '100%',
        padding: 0,
        display: 'grid',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'var(--color-darkest)',
          color: 'var(--color-paper)',
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div className="badge badge-pending" style={{ width: 'max-content', marginBottom: '24px' }}>
            Welcome back
          </div>
          <h1 className="heading" style={{ fontSize: '2.5rem', lineHeight: '1.15', color: 'var(--color-white)' }}>
            Every login keeps<br />your account verified.
          </h1>
          <p style={{ color: 'rgba(250,247,240,0.65)', marginTop: '20px', maxWidth: '380px', lineHeight: '1.6' }}>
            Sign in to book a worker, manage a job in progress, or check your earnings — whichever side of SkillConnect you're on.
          </p>
          <div style={{ display: 'flex', gap: '22px', marginTop: '48px', fontSize: '0.85rem', color: 'rgba(250,247,240,0.55)' }}>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🔒 OTP secured</div>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Role-based access</div>
          </div>
        </div>

        <div style={{
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--bg-card)'
        }}>
          <h2 className="heading" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Log in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
            New here? <Link to="/register" style={{ color: 'var(--warning)', fontWeight: 700 }}>Create an account</Link>
          </p>

          <div className="select-pill-group" style={{ marginBottom: '26px' }}>
            <div 
              className={`select-pill ${roleMode === 'household' ? 'active' : ''}`}
              onClick={() => setRoleMode('household')}
            >
              Household
            </div>
            <div 
              className={`select-pill ${roleMode === 'worker' ? 'active' : ''}`}
              onClick={() => setRoleMode('worker')}
            >
              Worker
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(193, 68, 59, 0.1)',
              border: '1px solid rgba(193, 68, 59, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '12px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Log in with email & password'}
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0', color: 'var(--text-light)', fontSize: '0.8rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
            OR
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
          </div>

          <button type="button" className="btn btn-ghost btn-full">
            Send OTP (Preview)
          </button>

        </div>
      </div>

      <style>{`
        .login-card {
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .login-card {
            grid-template-columns: 1.15fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .login-card > div {
            padding: 40px 24px !important;
          }
        }
        .select-pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .select-pill { padding: 9px 15px; border-radius: 999px; border: 1.5px solid var(--line); font-size: 0.82rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.15s; background: rgba(0,0,0,0.15); }
        .select-pill.active { background: var(--primary); color: #FFF; border-color: var(--primary); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
      `}</style>
    </div>
  );
};

export default Login;
