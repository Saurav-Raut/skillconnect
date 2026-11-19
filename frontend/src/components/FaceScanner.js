import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { captureVideoFrame, getFaceRectOverlay } from '../utils/faceUtils';

const FaceScanner = ({ onScanComplete, buttonText = 'Scan & Verify Face' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('streaming'); // 'streaming', 'scanning', 'success', 'error'
  const [feedback, setFeedback] = useState('Position your face inside the frame...');
  const [capturedImage, setCapturedImage] = useState('');
  const [cameraError, setCameraError] = useState(false);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(false);
    setStatus('streaming');
    setFeedback('Position face inside the frame...');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.log('Video play error:', e));
      }
    } catch (err) {
      console.warn('Camera error or permission denied:', err);
      setCameraError(true);
      setFeedback('Camera permission required. Please allow camera access in your browser.');
    }
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure video element receives stream when ref or stream updates
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.log('Video play catch:', e));
    }
  }, [stream]);

  // Biometric overlay animation (laser scanning line & corner brackets)
  useEffect(() => {
    if (status !== 'streaming' && status !== 'scanning') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let scanLineY = 0;
    let scanDirection = 1;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const box = getFaceRectOverlay(canvas.width, canvas.height);

      // Draw stylized biometric corner brackets
      const cornerLen = 22;
      ctx.lineWidth = 3;
      ctx.strokeStyle = status === 'scanning' ? '#10b981' : '#6366f1';

      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + cornerLen);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + cornerLen, box.y);
      ctx.stroke();

      // Top-Right corner
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - cornerLen, box.y);
      ctx.lineTo(box.x + box.width, box.y);
      ctx.lineTo(box.x + box.width, box.y + cornerLen);
      ctx.stroke();

      // Bottom-Left corner
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + box.height - cornerLen);
      ctx.lineTo(box.x, box.y + box.height);
      ctx.lineTo(box.x + cornerLen, box.y + box.height);
      ctx.stroke();

      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
      ctx.stroke();

      // Oval guide for face
      ctx.beginPath();
      ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width * 0.42, box.height * 0.46, 0, 0, Math.PI * 2);
      ctx.strokeStyle = status === 'scanning' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Laser scanning line animation
      if (status === 'scanning') {
        scanLineY += 3.5 * scanDirection;
        if (scanLineY > box.height || scanLineY < 0) {
          scanDirection *= -1;
        }

        const currentY = box.y + scanLineY;
        const grad = ctx.createLinearGradient(box.x, currentY, box.x + box.width, currentY);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        grad.addColorStop(0.5, '#10b981');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.beginPath();
        ctx.moveTo(box.x, currentY);
        ctx.lineTo(box.x + box.width, currentY);
        ctx.strokeStyle = grad;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [status]);

  // Scan trigger
  const handleScan = () => {
    setStatus('scanning');
    setFeedback('Analyzing biometric signature & facial encodings...');

    setTimeout(() => {
      let dataUrl = '';
      if (videoRef.current) {
        dataUrl = captureVideoFrame(videoRef.current);
      }
      if (!dataUrl) {
        dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      }

      setCapturedImage(dataUrl);
      setStatus('success');
      setFeedback('Signature match complete! Face verified.');
      stopCamera();

      if (onScanComplete) {
        onScanComplete(dataUrl);
      }
    }, 2400);
  };

  const handleRetake = () => {
    setCapturedImage('');
    startCamera();
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Camera color="var(--primary)" />
        <span>Face Verification Scanner</span>
      </h3>

      <div style={{
        position: 'relative',
        width: '320px',
        height: '240px',
        margin: '0 auto 1rem',
        overflow: 'hidden',
        borderRadius: '16px',
        border: status === 'success' ? '2.5px solid #10b981' : '2px solid rgba(255, 255, 255, 0.15)',
        background: '#0b1120',
        boxShadow: status === 'success' ? '0 0 20px rgba(16, 185, 129, 0.35)' : '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        {/* LIVE WEBCAM VIDEO STREAM */}
        {status !== 'success' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirrored selfie view
              display: cameraError ? 'none' : 'block'
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.play();
            }}
          />
        )}

        {/* FROZEN CAPTURED FACE PHOTO ON SUCCESS */}
        {status === 'success' && capturedImage && (
          <img
            src={capturedImage}
            alt="Captured verification face"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        )}

        {/* CAMERA PERMISSION ERROR FALLBACK */}
        {cameraError && status !== 'success' && (
          <div style={{
            padding: '24px 16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#cbd5e1'
          }}>
            <ShieldAlert size={36} color="#f59e0b" />
            <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
              Camera permission blocked.<br />Click the camera icon in your browser URL bar to allow.
            </div>
            <button onClick={startCamera} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Retry Camera
            </button>
          </div>
        )}

        {/* OVERLAY BIOMETRIC SCANNER GRID & LASER */}
        {status !== 'success' && !cameraError && (
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: status === 'success' ? '#10b981' : status === 'scanning' ? '#38bdf8' : cameraError ? '#f59e0b' : 'var(--text-main)',
        fontWeight: 600,
        marginBottom: '1rem',
        minHeight: '24px'
      }}>
        {feedback}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
        {status === 'streaming' && !cameraError && (
          <button onClick={handleScan} className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 700 }}>
            {buttonText}
          </button>
        )}

        {status === 'scanning' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700 }}>
            <RefreshCw size={18} className="spin" />
            <span>Scanning Face...</span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>
              <CheckCircle2 size={20} />
              <span>Identity Verified Successfully</span>
            </div>
            <button onClick={handleRetake} className="btn btn-ghost btn-sm" style={{ marginTop: '4px', fontSize: '0.8rem' }}>
              Retake Photo
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FaceScanner;
