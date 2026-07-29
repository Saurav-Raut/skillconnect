import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import { Globe, Menu, X, Settings, Moon, Sun, Info, LogOut, Home as HomeIcon, HelpCircle, Search, Briefcase, LayoutDashboard, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { language, changeLanguage, t } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(27, 38, 59, 0.95)', /* Matches --color-dark */
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--line-dark)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 6vw',
        maxWidth: '1360px',
        margin: '0 auto'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(150deg, var(--color-medium) 0%, var(--color-light) 100%)',
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: '8px',
              height: '5px',
              borderLeft: '2px solid var(--warning)',
              borderBottom: '2px solid var(--warning)',
              transform: 'rotate(-45deg) translateY(-1px)'
            }} />
          </div>
          <span className="heading" style={{ fontSize: '1.2rem', color: 'var(--color-white)' }}>SkillConnect</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }} className="nav-links-desktop">
          <Link to="/" className="nav-pill"><HomeIcon size={15} /> {t('nav_home')}</Link>
          <a href="/#how" className="nav-pill"><HelpCircle size={15} /> {t('nav_how')}</a>
          <Link to="/search" className="nav-pill"><Search size={15} /> {t('nav_search')}</Link>
          
          {!userInfo && (
            <Link to="/register" className="nav-pill"><Briefcase size={15} /> {t('nav_for_workers')}</Link>
          )}

          {userInfo && (
            <>
              {userInfo.role === 'admin' ? (
                <Link to="/admin" className="nav-pill"><ShieldCheck size={15} /> Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="nav-pill"><LayoutDashboard size={15} /> {t('nav_dashboard')}</Link>
              )}
              {userInfo.role === 'worker' && (
                <Link to="/grievances" className="nav-pill"><AlertTriangle size={15} /> Grievances</Link>
              )}
            </>
          )}
        </div>

        {/* Right Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          <div style={{ position: 'relative' }} className="nav-lang-desktop">
            <div 
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-white)',
                background: settingsOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '7px 12px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <Settings size={15} /> Settings
            </div>

            {settingsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '260px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--line)',
                overflow: 'hidden',
                zIndex: 100,
                color: 'var(--text-card)'
              }}>
                {/* Account Info */}
                {userInfo ? (
                  <div style={{ padding: '18px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{userInfo.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.8, marginTop: '2px' }}>{userInfo.email}</div>
                  </div>
                ) : (
                  <div style={{ padding: '18px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('settings_guest')}</div>
                    <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '2px', display: 'block' }}>{t('settings_login')}</Link>
                  </div>
                )}

                <div style={{ padding: '8px' }}>
                  <div className="setting-item" onClick={() => {
                    const langs = ['en', 'hi', 'te', 'ta'];
                    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
                    changeLanguage(langs[nextIndex]);
                  }}>
                    <Globe size={16} /> <span>{t('settings_language')}: {language.toUpperCase()}</span>
                  </div>
                  <div className="setting-item" onClick={toggleTheme}>
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} 
                    <span>{t('settings_theme')}: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </div>
                  <div className="setting-item">
                    <Info size={16} /> <span>{t('settings_version')}: v1.0.0</span>
                  </div>
                </div>

                {userInfo && (
                  <div style={{ padding: '8px', borderTop: '1px solid var(--line)' }}>
                    <div 
                      className="setting-item setting-logout" 
                      onClick={() => { handleLogout(); setSettingsOpen(false); }}
                    >
                      <LogOut size={16} /> <span>{t('settings_logout')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {userInfo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundImage: localStorage.getItem(`avatar_${userInfo._id}`) ? `url(${localStorage.getItem(`avatar_${userInfo._id}`)})` : 'none',
                  backgroundColor: 'rgba(250,247,240,0.12)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  flexShrink: 0
                }} />
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-white)' }}>
                  {userInfo.name.split(' ')[0]}
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '999px', fontSize: '0.85rem' }}>
              Log in
            </Link>
          )}

          <button 
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={24} color="var(--color-white)" /> : <Menu size={24} color="var(--color-white)" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 6vw 18px',
          background: 'var(--color-dark)',
          borderTop: '1px solid var(--line-dark)'
        }}>
          <Link to="/" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-light)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Home</Link>
          <a href="/#how" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-light)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>How it works</a>
          <Link to="/search" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-light)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Find workers</Link>
          {!userInfo && (
            <Link to="/register" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-light)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>For workers</Link>
          )}
          {userInfo && (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-paper)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Dashboard</Link>
              <div 
                onClick={() => { handleLogout(); setMobileOpen(false); }} 
                style={{ padding: '11px 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--warning)', cursor: 'pointer' }}
              >
                Logout
              </div>
            </>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive hide/show and settings dropdown */}
      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .nav-lang-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
        .nav-pill {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.85rem; font-weight: 600;
          color: var(--color-light); background: transparent;
          border: 1px solid transparent;
          padding: 7px 12px; border-radius: 999px;
          transition: 0.2s;
        }
        .nav-pill:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .setting-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 8px;
          font-size: 0.9rem; font-weight: 500; cursor: pointer;
          color: var(--text-main); transition: 0.2s;
        }
        .setting-item:hover {
          background: rgba(65, 90, 119, 0.15); color: var(--text-strong);
        }
        .setting-logout { color: var(--warning); }
        .setting-logout:hover { background: rgba(244, 169, 59, 0.1); color: var(--warning); }
      `}</style>
    </nav>
  );
};

export default Navbar;
