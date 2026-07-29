import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <footer style={{
      background: 'var(--color-dark)',
      color: 'var(--color-paper)',
      padding: '60px 6vw 0',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <div className="footer-top" style={{
          display: 'grid',
          gap: '40px',
          paddingBottom: '44px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.15rem',
              marginBottom: '14px'
            }}>
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                background: 'linear-gradient(150deg, var(--warning), #D6902B)'
              }}></span>
              SkillConnect
            </div>
            <p style={{
              fontSize: '0.86rem',
              color: 'rgba(250, 247, 240, 0.55)',
              maxWidth: '280px',
              lineHeight: 1.6,
              marginBottom: '18px'
            }}>
              Safety-first, trust-driven booking for local skilled workers — verified identity, live tracking, and escrow-protected payments on every job.
            </p>

            <button
              onClick={() => setShowQrModal(true)}
              style={{
                background: 'rgba(37, 99, 235, 0.18)',
                border: '1px solid #3B82F6',
                color: '#60A5FA',
                padding: '9px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              title="Download APK / Scan Expo Go QR Code"
            >
              <span>📱</span>
              <span>Download Mobile App (EAS)</span>
            </button>
          </div>

          <div className="footer-col">
            <h4>For households</h4>
            <Link to="/search">Find a worker</Link>
            <a href="/#how">How booking works</a>
            <a href="/#trust">Safety features</a>
            <Link to="/register">Create an account</Link>
          </div>

          <div className="footer-col">
            <h4>For workers</h4>
            <Link to="/register">Register as a worker</Link>
            <Link to="/dashboard">Verification process</Link>
            <Link to="/dashboard">Earnings dashboard</Link>
            <Link to="/login">Worker login</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/support">Help & support</Link>
            <Link to="/notifications">Notifications</Link>
            <a href="#terms">Terms of service</a>
            <a href="#privacy">Privacy policy</a>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 0',
          fontSize: '0.75rem',
          color: 'rgba(250, 247, 240, 0.42)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div className="mono" style={{ letterSpacing: '0.04em' }}>
            THULLUR · VIJAYAWADA · GUNTUR — ANDHRA PRADESH
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="mono footer-badge">ID verified</span>
            <span className="mono footer-badge">Escrow protected</span>
            <span className="mono footer-badge">SOS ready</span>
            <span className="mono footer-badge" style={{ borderColor: '#3B82F6', color: '#60A5FA' }}>
              React Native Expo Sync
            </span>
          </div>
          <div>© 2026 SkillConnect</div>
        </div>
      </div>

      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📱</div>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '6px' }}>
              SkillConnect Mobile App
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Scan the QR code with your phone camera or Expo Go to test real-time booking and biometric face verification on iOS & Android.
            </p>

            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('https://expo.dev/client')}`}
                alt="Scan to download Expo Go on iOS and Android"
                style={{ width: '150px', height: '150px', display: 'block' }}
              />
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px' }}>
              <b>How to connect:</b> Scan above to install <b>Expo Go</b> on your phone, then run <code style={{ color: '#60A5FA' }}>npx expo start</code> in <code style={{ color: '#60A5FA' }}>/mobile</code> and scan the terminal QR code!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="https://expo.dev/client"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'block'
                }}
              >
                📥 Get Expo Go App (iOS & Android)
              </a>

              <a
                href="https://docs.expo.dev/build/setup/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'block'
                }}
              >
                🛠️ How to Build Standalone APK (EAS CLI)
              </a>

              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.88rem'
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .footer-top {
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
        }
        .footer-col h4 {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(250, 247, 240, 0.42);
          font-weight: 700;
          margin-bottom: 16px;
        }
        .footer-col a {
          display: block;
          font-size: 0.86rem;
          color: rgba(250, 247, 240, 0.72);
          margin-bottom: 12px;
          transition: 0.15s;
        }
        .footer-col a:hover {
          color: var(--warning);
        }
        .footer-badge {
          font-size: 0.68rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 9px;
          border-radius: 999px;
          color: rgba(250, 247, 240, 0.6);
        }
        @media (max-width: 900px) {
          .footer-top { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px) {
          .footer-top { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
