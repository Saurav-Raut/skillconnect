/**
 * Simulated client-side face extraction utilities.
 * Captures image files, parses frame averages, and prepares signatures.
 */

// Helper to capture a frame from an HTML video element and return a base64 string
export const captureVideoFrame = (videoElement) => {
  if (!videoElement) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Draw scanning grid overlay on the captured frame to show visual feedback
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.2, canvas.width * 0.5, canvas.height * 0.6);
    
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.error('Failed to capture frame:', err);
    return null;
  }
};

// Generates simulated face grid coordinates to display on canvas overlays
export const getFaceRectOverlay = (width, height) => {
  const boxWidth = width * 0.5;
  const boxHeight = height * 0.6;
  const x = (width - boxWidth) / 2;
  const y = (height - boxHeight) / 2;
  return { x, y, width: boxWidth, height: boxHeight };
};
