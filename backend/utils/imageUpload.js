const fs = require('fs');
const path = require('path');

const uploadImage = async (file) => {
  // Check if Cloudinary is configured
  if (process.env.CLOUDINARY_URL) {
    try {
      const cloudinary = require('cloudinary').v2;
      // Configure cloudinary if needed (it usually auto-configures from CLOUDINARY_URL env var)
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'skillconnect'
      });
      // Delete temporary local file
      try {
        fs.unlinkSync(file.path);
      } catch (err) {}
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, using local fallback:', error.message);
    }
  }

  // Fallback: Use local file URL. Multer saves to backend/uploads, we serve static files.
  // We return path matching /uploads/filename.
  return `/uploads/${path.basename(file.path)}`;
};

module.exports = { uploadImage };
