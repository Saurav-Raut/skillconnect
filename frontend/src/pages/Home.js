import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

const Home = () => {
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <header className="hero container">
        <div className="hero__bg-grid"></div>
        <div className="hero__copy">
          <div className="badge badge-verified" style={{ marginBottom: '26px' }}>
            <span className="badge__dot"></span> <Shield size={14} style={{ marginRight: '6px' }} /> {t('hero_badge')}
          </div>
          <h1 className="heading hero__title">
            {t('hero_title_1')}<br />
            <em style={{ fontStyle: 'italic', color: 'var(--warning)', fontWeight: 500 }}>{t('hero_title_2')}</em>
          </h1>
          <p className="hero__sub">
            {t('hero_desc')}
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '34px' }}>
            <Link to="/search" className="btn btn-primary">
              Find a worker <span style={{ transition: 'transform 0.18s' }}>→</span>
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Register as a worker
            </Link>
          </div>
          
          <div className="hero__proof">
            <div><strong style={{ color: 'var(--text-strong)' }}>ID + Police</strong> verified</div>
            <div className="hero__proof-divider"></div>
            <div><strong style={{ color: 'var(--text-strong)' }}>Live</strong> location on every job</div>
            <div className="hero__proof-divider"></div>
            <div>Launching in <strong style={{ color: 'var(--text-strong)' }}>Thullur, AP</strong></div>
          </div>
        </div>

        <div className="card-stage">
          <div className="id-card">
            <div className="id-card__top">
              <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.55)' }}>
                SkillConnect · Worker Pass
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(47,158,104,0.18)',
                border: '1px solid rgba(47,158,104,0.45)', color: '#6FD6A0', padding: '5px 9px', borderRadius: '999px', fontSize: '0.62rem', fontWeight: 600
              }}>✓ Verified</div>
            </div>
            
            <div className="id-card__photo">
              <img src="/worker-avatar.png" alt="Worker avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
              <div className="scan-line"></div>
            </div>
            
            <div className="heading" style={{ marginTop: '18px', fontSize: '1.2rem' }}>Ravi Kumar</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(250,247,240,0.6)', marginTop: '2px' }}>Electrician · Thullur, AP</div>
            
            <div className="id-card__checks">
              <div className="check-row"><span className="check-icon"></span>Government ID matched</div>
              <div className="check-row"><span className="check-icon"></span>Face scan at arrival</div>
              <div className="check-row"><span className="check-icon"></span>Face scan at job close</div>
            </div>
            
            <div className="id-card__footer">
              <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(250,247,240,0.5)' }}>ID · SC-2026-0417</span>
            </div>
          </div>
          
          <div className="floater floater--sos">
            <span className="floater__dot" style={{ background: 'var(--danger)' }}></span>SOS ready
          </div>
          <div className="floater floater--escrow">
            <span className="floater__dot" style={{ background: 'var(--warning)' }}></span>Escrow held ₹800
          </div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="trust-strip__inner container">
          <div className="trust-item">
            <div className="trust-item__icon">ID</div>
            <div>
              <div className="trust-item__title">Identity checked</div>
              <div className="trust-item__desc">Government ID and address proof reviewed before anyone joins.</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon">◎</div>
            <div>
              <div className="trust-item__title">Face matched</div>
              <div className="trust-item__desc">Scanned at job start and again at close — the same person, start to finish.</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon">◈</div>
            <div>
              <div className="trust-item__title">Live tracked</div>
              <div className="trust-item__desc">Your household sees the worker's location for the entire visit.</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-item__icon">₹</div>
            <div>
              <div className="trust-item__title">Escrow paid</div>
              <div className="trust-item__desc">Payment is held safely and released only once the job is confirmed done.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="how__head">
          <div className="mono" style={{ fontSize: '0.76rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 700 }}>How a booking works</div>
          <h2 className="heading" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginTop: '10px' }}>Three checkpoints, one visit.</h2>
        </div>
        <div className="how__steps">
          <div className="step">
            <div className="step__num heading">1</div>
            <div className="step__title">Search and book</div>
            <div className="step__desc">Filter workers by skill and locality, check their verified badge and reviews, then book instantly or for later.</div>
          </div>
          <div className="step">
            <div className="step__num heading">2</div>
            <div className="step__title">Face-matched on arrival</div>
            <div className="step__desc">The worker scans their face against their profile before the job starts. You track them live until they arrive.</div>
          </div>
          <div className="step">
            <div className="step__num heading">3</div>
            <div className="step__title">Confirm and release payment</div>
            <div className="step__desc">A second face scan closes the job. Once you confirm completion, escrow releases payment automatically.</div>
          </div>
        </div>
      </section>

      {/* SPLIT CTA */}
      <section className="split" id="worker">
        <div className="split__panel">
          <div className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 700 }}>For households</div>
          <h3 className="heading split__title">Book someone you can actually trust.</h3>
          <p className="split__desc">Set your locality and language, then browse verified workers with real ratings from your community.</p>
          <Link to="/search" className="split__link">Find a worker →</Link>
        </div>
        <div className="split__panel split__panel--worker">
          <div className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 700 }}>For workers</div>
          <h3 className="heading split__title">Get booked directly. No middlemen.</h3>
          <p className="split__desc">Set your trade, area and price, upload your ID once, and start receiving jobs with fair, escrow-protected pay.</p>
          <Link to="/register" className="split__link">Register as a worker →</Link>
        </div>
      </section>

      <style>{`
        .hero {
          position: relative;
          padding: 88px 6vw 60px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
          overflow: hidden;
        }
        .hero__bg-grid {
          position: absolute; inset: 0; z-index: -1;
          background-image: 
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 70% 55% at 30% 20%, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 55% at 30% 20%, black 0%, transparent 70%);
          opacity: 0.6;
        }
        .hero__title {
          font-size: clamp(2.5rem, 4.6vw, 4rem);
          line-height: 1.04;
          letter-spacing: -0.01em;
          animation: fadeUp 0.75s ease forwards;
        }
        .hero__sub {
          margin-top: 22px;
          max-width: 480px;
          font-size: 1.08rem;
          color: var(--text-muted);
          animation: fadeUp 0.75s ease 0.16s forwards;
          opacity: 0;
        }
        .hero__proof {
          margin-top: 40px;
          display: flex;
          align-items: center;
          gap: 22px;
          font-size: 0.82rem;
          color: var(--text-muted);
          opacity: 0;
          animation: fadeUp 0.75s ease 0.32s forwards;
        }
        .hero__proof-divider { width: 1px; height: 26px; background: var(--line); }
        
        .card-stage {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          min-height: 460px;
          opacity: 0; animation: fadeUp 0.9s ease 0.3s forwards;
        }
        .id-card {
          width: 320px;
          background: linear-gradient(165deg, var(--color-darkest) 0%, var(--color-dark) 100%);
          border-radius: 20px;
          padding: 26px 24px 24px;
          color: var(--color-white);
          box-shadow: 0 30px 60px -20px rgba(13,27,42,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset;
          transform: rotate(-3deg);
        }
        .id-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
        .id-card__photo {
          margin-top: 18px; width: 100%; height: 168px; border-radius: 12px;
          background: linear-gradient(150deg, var(--color-medium), var(--color-darkest));
          position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: center;
        }
        .id-card__checks { margin-top: 16px; display: flex; flex-direction: column; gap: 9px; }
        .check-row { display: flex; align-items: center; gap: 9px; font-size: 0.78rem; color: rgba(250,247,240,0.85); opacity: 0; animation: fadeUp 0.4s ease 0.7s forwards; }
        .check-icon {
          width: 17px; height: 17px; border-radius: 50%; background: var(--verified); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .check-icon::after { content: ""; width: 7px; height: 4px; border-left: 1.6px solid var(--color-darkest); border-bottom: 1.6px solid var(--color-darkest); transform: rotate(-45deg) translateY(-1px); }
        .id-card__footer { margin-top: 18px; padding-top: 14px; border-top: 1px dashed rgba(250,247,240,0.2); }
        
        .floater {
          position: absolute; background: var(--color-white);
          border: 1px solid var(--line); border-radius: 12px;
          padding: 10px 13px; box-shadow: var(--shadow-sm);
          font-size: 0.76rem; font-weight: 700; color: var(--color-darkest);
          display: flex; align-items: center; gap: 8px;
          opacity: 0; animation: fadeUp 0.6s ease forwards;
        }
        .floater__dot { width: 8px; height: 8px; border-radius: 50%; }
        .floater--sos { top: 6%; right: 2%; animation-delay: 1.5s; }
        .floater--escrow { bottom: 8%; left: -2%; animation-delay: 1.7s; }

        .trust-strip { padding: 30px 0; }
        .trust-strip__inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding-top: 20px; padding-bottom: 20px; }
        
        .trust-item { 
          background-color: var(--bg-card);
          background-image: 
            radial-gradient(circle at top right, var(--card-gradient) 0%, transparent 50%),
            radial-gradient(circle at bottom left, var(--card-gradient) 0%, transparent 50%),
            radial-gradient(var(--card-pattern) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 14px 14px;
          padding: 28px 24px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; 
          flex-direction: column;
          gap: 18px; 
          align-items: flex-start; 
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        
        .trust-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -10px rgba(65, 90, 119, 0.3);
        }
        
        .trust-item__icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(244, 169, 59, 0.12); color: var(--warning); font-family: var(--font-mono); font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .trust-item__title { font-weight: 700; font-size: 1.05rem; color: var(--text-card); }
        .trust-item__desc { font-size: 0.88rem; color: var(--text-main); opacity: 0.9; line-height: 1.55; }

        .how { max-width: 1200px; margin: 0 auto; padding: 100px 6vw 110px; }
        .how__head { max-width: 560px; margin-bottom: 64px; }
        .how__steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; position: relative; }
        
        .step {
          background-color: var(--bg-card);
          background-image: 
            radial-gradient(circle at top right, var(--card-gradient) 0%, transparent 50%),
            radial-gradient(circle at bottom left, var(--card-gradient) 0%, transparent 50%),
            radial-gradient(var(--card-pattern) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 14px 14px;
          color: var(--text-card);
          padding: 36px 28px;
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        .step:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 20px 40px -12px rgba(65, 90, 119, 0.5); /* Blue glow */
        }
        
        .step::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step:hover::after {
          transform: scaleX(1);
        }

        .step__num { 
          width: 52px; height: 52px; border-radius: 50%; 
          background: rgba(119, 141, 169, 0.15); /* neutral tint */
          color: var(--text-card);
          display: flex; align-items: center; justify-content: center; 
          font-size: 1.3rem; margin-bottom: 24px; position: relative; z-index: 2; 
        }
        .step__title { font-weight: 700; font-size: 1.1rem; margin-bottom: 12px; color: var(--text-card); }
        .step__desc { font-size: 0.92rem; color: var(--text-main); opacity: 0.9; line-height: 1.6; }

        .split { background: var(--color-darkest); color: var(--color-white); display: grid; grid-template-columns: 1fr 1fr; }
        .split__panel { padding: 76px 5vw; }
        .split__panel--worker { border-left: 1px solid rgba(255,255,255,0.1); }
        .split__title { font-size: clamp(1.5rem, 2.4vw, 2rem); margin-top: 12px; max-width: 360px; color: var(--color-white); }
        .split__desc { margin-top: 14px; font-size: 0.94rem; color: rgba(250,247,240,0.65); max-width: 380px; line-height: 1.6; }
        .split__link { margin-top: 26px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.92rem; color: var(--warning); padding-bottom: 3px; border-bottom: 1.5px solid transparent; transition: 0.2s; }
        .split__link:hover { border-color: var(--warning); gap: 12px; }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding-top: 48px; }
          .card-stage { min-height: 380px; order: -1; }
          .id-card { width: 260px; }
          .trust-strip__inner { grid-template-columns: repeat(2, 1fr); }
          .how__steps { grid-template-columns: 1fr; gap: 34px; }
          .how__steps::before { display: none; }
          .split { grid-template-columns: 1fr; }
          .split__panel--worker { border-left: none; border-top: 1px solid rgba(255,255,255,0.1); }
          .floater--escrow { left: 4%; }
          .floater--sos { right: 4%; }
        }
        @media (max-width: 520px) {
          .hero { padding: 40px 5vw 40px; }
          .hero__proof { flex-wrap: wrap; }
          .trust-strip__inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Home;
