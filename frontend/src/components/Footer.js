import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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
              lineHeight: 1.6
            }}>
              Safety-first, trust-driven booking for local skilled workers — verified identity, live tracking, and escrow-protected payments on every job.
            </p>
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
          </div>
          <div>© 2026 SkillConnect</div>
        </div>
      </div>

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
