import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="fade-in" style={{
      height: 'calc(100vh - 66px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div>
        <div className="display" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.05em' }}>
          404
        </div>
        <div className="heading main__title" style={{ fontSize: '2rem', marginBottom: '16px' }}>
          Page not found
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
