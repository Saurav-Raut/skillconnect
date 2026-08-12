import React from 'react';
import { useSelector } from 'react-redux';

const WorkerEarningsPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { bookingsList } = useSelector((state) => state.booking);

  // Dynamic calculations based on real bookings
  const completedJobs = bookingsList ? bookingsList.filter(b => b.status === 'completed') : [];
  const totalGross = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  
  const platformFeePercentage = 10;
  const platformFeeAmount = (totalGross * platformFeePercentage) / 100;
  const totalNet = totalGross - platformFeeAmount;
  
  const jobsDone = completedJobs.length;

  // Real history for breakdown
  const historyData = completedJobs.map(job => ({
    title: job.skillRequested || job.skill || 'General task',
    date: new Date(job.createdAt).toLocaleDateString(),
    amount: job.totalAmount || 0,
    isDeduction: false
  }));
  if (platformFeeAmount > 0) {
    historyData.push({
      title: 'Platform Deduction',
      date: 'Auto-debited',
      amount: platformFeeAmount,
      isDeduction: true
    });
  }

  // Real graph data based on last 7 days (or day of week if simplified)
  // Group by day of week for the chart
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const groupedByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  completedJobs.forEach(job => {
    const d = new Date(job.createdAt);
    const dayName = days[d.getDay()];
    groupedByDay[dayName] += (job.totalAmount || 0);
  });

  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    amount: groupedByDay[day]
  }));

  return (
    <div className="fade-in">
      <div className="main__head">
        <div>
          <div className="heading main__title">Earnings & Insights</div>
          <div className="main__sub">Track your weekly income and platform fee deductions.</div>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '26px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross Earnings (Week)</div>
          <div className="heading" style={{ fontSize: '2rem', margin: '8px 0 4px', color: 'var(--text-main)' }}>₹{totalGross}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>{jobsDone} Jobs Completed</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform Fee (-{platformFeePercentage}%)</div>
          <div className="heading" style={{ fontSize: '2rem', margin: '8px 0 4px', color: 'var(--danger)' }}>-₹{platformFeeAmount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', opacity: 0.8, fontWeight: 600 }}>Trust & Safety Charge</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'var(--primary)', color: 'white' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Income (Payout)</div>
          <div className="heading" style={{ fontSize: '2rem', margin: '8px 0 4px', color: 'white' }}>₹{totalNet}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600 }}>Available for withdrawal</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="earnings-layout">
        
        {/* Left Column: Graph */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, marginBottom: '24px', fontSize: '1.1rem' }}>Income Progress (This Week)</div>
          
          <div className="bar-chart-container">
            <div className="bar-chart-grid">
              <div className="bar-chart-grid-line"></div>
              <div className="bar-chart-grid-line"></div>
              <div className="bar-chart-grid-line"></div>
              <div className="bar-chart-grid-line"></div>
            </div>
            
            {weeklyData.map((data, index) => {
              const maxAmount = Math.max(...weeklyData.map(d => d.amount));
              const isHighest = data.amount === maxAmount && maxAmount > 0;
              const heightPercent = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="bar-chart-bar-wrapper">
                  <div className="bar-chart-tooltip">₹{data.amount}</div>
                  <div 
                    className="bar-chart-bar"
                    style={{ 
                      height: `${heightPercent}%`, 
                      background: isHighest 
                        ? 'linear-gradient(to top, var(--primary), #818cf8)' 
                        : 'linear-gradient(to top, var(--line), rgba(99, 102, 241, 0.15))',
                      boxShadow: isHighest ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                      minHeight: data.amount > 0 ? '4%' : '2px'
                    }}
                  ></div>
                  <div className="bar-chart-label" style={{ color: isHighest ? 'var(--primary)' : 'var(--text-muted)' }}>{data.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Transaction History</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {historyData.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No completed jobs yet.</div>
            ) : (
              historyData.map((item, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{item.date}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: item.isDeduction ? 'var(--danger)' : 'var(--success)' }}>
                      {item.isDeduction ? '-' : '+'}₹{item.amount}
                    </div>
                  </div>
                  {i < historyData.length - 1 && <div style={{ height: '1px', background: 'var(--line)' }}></div>}
                </React.Fragment>
              ))
            )}
          </div>

          <button className="btn btn-ghost btn-full" style={{ marginTop: '24px' }}>View all statements</button>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .earnings-layout {
            grid-template-columns: 1fr !important;
          }
        }
        .bar-chart-container {
          position: relative;
          height: 220px;
          margin-top: auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-bottom: 30px;
        }
        .bar-chart-grid {
          position: absolute;
          inset: 0;
          bottom: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
          z-index: 0;
        }
        .bar-chart-grid-line {
          width: 100%;
          height: 1px;
          background: var(--line);
          opacity: 0.5;
        }
        .bar-chart-bar-wrapper {
          position: relative;
          z-index: 1;
          width: 12%;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          cursor: pointer;
        }
        .bar-chart-bar-wrapper:hover .bar-chart-bar {
          filter: brightness(1.1);
          transform: scaleY(1.02);
        }
        .bar-chart-bar-wrapper:hover .bar-chart-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
        .bar-chart-bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          transition: all 0.3s ease;
          transform-origin: bottom;
        }
        .bar-chart-tooltip {
          position: absolute;
          top: -35px;
          background: var(--text-main);
          color: var(--bg-main);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.2s ease;
          pointer-events: none;
          white-space: nowrap;
        }
        .bar-chart-label {
          position: absolute;
          bottom: -25px;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default WorkerEarningsPage;
