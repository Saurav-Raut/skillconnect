const Worker = require('../models/Worker');

/**
 * Checks for workers whose face data has expired and clears the encryption data
 * to maintain privacy compliance and data security.
 */
const cleanExpiredFaceData = async () => {
  try {
    const now = new Date();
    // Find workers where faceDataExpiresAt is in the past and encoding is not empty
    const expiredWorkers = await Worker.find({
      faceEncodingEncrypted: { $ne: '' },
      faceDataExpiresAt: { $lte: now }
    });

    if (expiredWorkers.length > 0) {
      console.log(`[Face Data Policy] Found ${expiredWorkers.length} expired face encodings. Clearing records...`);
      for (const worker of expiredWorkers) {
        worker.faceEncodingEncrypted = '';
        worker.faceDataExpiresAt = null;
        await worker.save();
        console.log(`[Face Data Policy] Expired face encoding cleared for Worker ID: ${worker._id}`);
      }
    }
  } catch (error) {
    console.error('[Face Data Policy] Error cleaning expired face data:', error.message);
  }
};

/**
 * Helper to calculate face data expiration date (e.g., 30 days retention policy)
 */
const getFaceDataExpiryDate = (days = 30) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

module.exports = {
  cleanExpiredFaceData,
  getFaceDataExpiryDate
};
