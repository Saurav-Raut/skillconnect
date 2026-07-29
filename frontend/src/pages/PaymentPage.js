import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building, CheckCircle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

const PaymentPage = () => {
  const { bookingId = 'SK8291' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const amount = queryParams.get('amount') || 950;
  const workerName = queryParams.get('worker') || 'Karthik Reddy';
  const skill = queryParams.get('skill') || 'Electrician';

  const [method, setMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      // Trigger Customer SMS Acceptance alert (Worker accepted job) after payment
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('customerSMSAlert', {
          detail: {
            bookingId: bookingId,
            workerName: 'Karthik Reddy (Verified Plumber)',
            status: 'Accepted & En Route',
            message: `Worker Karthik Reddy has ACCEPTED your booking (${skill || 'Service'})! They are en route to your location. Escrow ₹${amount || '950'} is locked securely.`
          }
        }));
      }, 800);

      // Redirect to Tracking page after 3 seconds
      setTimeout(() => {
        navigate(`/tracking/${bookingId}`);
      }, 3200);
    }, 1800);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 6vw 80px' }}>
      
      {/* Security Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0) 100%)',
        border: '1.5px solid rgba(34, 197, 94, 0.4)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              100% Escrow Protection & 256-Bit SSL Encrypted Checkout
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Your money stays locked in escrow and is NEVER released to {workerName} until you confirm work completion.
            </div>
          </div>
        </div>
        <div className="badge badge-verified" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Lock size={14} style={{ marginRight: '4px' }} /> RBI Compliant
        </div>
      </div>

      {success ? (
        <div className="card" style={{ padding: '48px 30px', textAlign: 'center', maxWidth: '540px', margin: '40px auto' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', animation: 'scaleUp 0.4s ease'
          }}>
            <CheckCircle size={48} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
            Payment Secured in Escrow!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Booking <b style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>#{bookingId}</b> confirmed. An automated SMS dispatch has been sent to <b>{workerName}</b>.
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Escrow Hold Amount:</span>
              <span style={{ fontWeight: 800, color: 'var(--verified)' }}>₹{amount}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>En Route / Dispatching</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <Clock size={16} className="spin" /> Redirecting to Live Rapido GPS Tracking...
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* LEFT: PAYMENT METHOD SELECTION */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '20px' }}>
              Select Payment Method
            </div>

            {/* Method Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMethod('upi')}
                style={{
                  flex: 1, minWidth: '130px', padding: '14px 12px',
                  border: method === 'upi' ? '2px solid var(--primary)' : '1px solid var(--line)',
                  background: method === 'upi' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-main)',
                  borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  fontWeight: 700, color: method === 'upi' ? 'var(--primary)' : 'var(--text-main)',
                  transition: '0.2s'
                }}
              >
                <Smartphone size={22} /> UPI (GPay / PhonePe)
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                style={{
                  flex: 1, minWidth: '130px', padding: '14px 12px',
                  border: method === 'card' ? '2px solid var(--primary)' : '1px solid var(--line)',
                  background: method === 'card' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-main)',
                  borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  fontWeight: 700, color: method === 'card' ? 'var(--primary)' : 'var(--text-main)',
                  transition: '0.2s'
                }}
              >
                <CreditCard size={22} /> Credit / Debit Card
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                style={{
                  flex: 1, minWidth: '130px', padding: '14px 12px',
                  border: method === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--line)',
                  background: method === 'netbanking' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-main)',
                  borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  fontWeight: 700, color: method === 'netbanking' ? 'var(--primary)' : 'var(--text-main)',
                  transition: '0.2s'
                }}
              >
                <Building size={22} /> Net Banking
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {/* UPI FORM */}
              {method === 'upi' && (
                <div className="fade-in">
                  <div className="field">
                    <label>Enter Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 9876543210@ybl or username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      A verification request will be sent to your UPI app.
                    </div>
                  </div>

                  <div style={{ margin: '20px 0', textAlign: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--line)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Quick Pay with Any UPI App</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Scan QR code or click pay button below
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <span className="badge" style={{ padding: '6px 12px' }}>GPay</span>
                      <span className="badge" style={{ padding: '6px 12px' }}>PhonePe</span>
                      <span className="badge" style={{ padding: '6px 12px' }}>Paytm</span>
                      <span className="badge" style={{ padding: '6px 12px' }}>BHIM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD FORM */}
              {method === 'card' && (
                <div className="fade-in">
                  <div className="field">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Name as printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Card Number</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="4532 •••• •••• 8910"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="field">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>CVV / CVC</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING FORM */}
              {method === 'netbanking' && (
                <div className="fade-in">
                  <div className="field">
                    <label>Select Your Bank</label>
                    <select className="input" required>
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
                }}
              >
                {processing ? (
                  <span>Securing Escrow Deposit...</span>
                ) : (
                  <>
                    <Lock size={18} /> Pay ₹{amount}.00 & Lock in Escrow <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: ESCROW & ORDER SUMMARY */}
          <div className="card" style={{ padding: '24px', alignSelf: 'start', background: 'var(--bg-main)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              Booking & Escrow Summary
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Worker:</span>
              <span style={{ fontWeight: 700 }}>{workerName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Skill Type:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{skill}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Service Rate (Estimated):</span>
              <span style={{ fontWeight: 700 }}>₹{amount}.00</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Escrow Protection Fee:</span>
              <span style={{ color: 'var(--verified)', fontWeight: 700 }}>FREE (Promo)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxes & GST (18% included):</span>
              <span style={{ fontWeight: 700 }}>₹0.00</span>
            </div>

            <div style={{ borderTop: '2px solid var(--line)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Escrow Deposit:</span>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--verified)' }}>₹{amount}.00</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
              <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <b>How SkillConnect Escrow works:</b> Upon clicking pay, funds are deposited into RBI-regulated escrow account. The worker is notified via SMS to dispatch. Money is transferred to worker only after you verify completion.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PaymentPage;
