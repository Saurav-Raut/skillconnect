const crypto = require('crypto');

// Secret key for encrypting face encoding
const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'skillconnect_super_secret_key_123!', 'salt_salt', 32);
const IV_LENGTH = 16;

// Encrypt string helper
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt string helper
const decrypt = (text) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return null;
  }
};

// Generates a mock 128-dimensional face descriptor vector.
// Seeded by the input or random to simulate ML feature extraction.
const generateFaceDescriptor = (inputString) => {
  const hash = crypto.createHash('sha256').update(inputString || Math.random().toString()).digest('hex');
  const descriptor = [];
  for (let i = 0; i < 128; i++) {
    // Generate values between -1 and 1
    const byteIndex = i % 32;
    const charCode = hash.charCodeAt(byteIndex);
    descriptor.push(Math.sin(charCode + i));
  }
  return descriptor;
};

// Encrypt and store the face encoding
const encryptFaceEncoding = (descriptorArray) => {
  const jsonStr = JSON.stringify(descriptorArray);
  return encrypt(jsonStr);
};

// Calculate Euclidean distance between two vectors
const getEuclideanDistance = (v1, v2) => {
  if (v1.length !== v2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
};

// Compare verification image to saved face data
const verifyFaceMatch = (encryptedSavedEncoding, incomingImageBase64OrText) => {
  if (!encryptedSavedEncoding) return { success: false, confidence: 0, distance: 1.0 };
  
  const decryptedStr = decrypt(encryptedSavedEncoding);
  if (!decryptedStr) return { success: false, confidence: 0, distance: 1.0 };
  
  const savedDescriptor = JSON.parse(decryptedStr);
  // Generate a descriptor for the incoming face capture
  const incomingDescriptor = generateFaceDescriptor(incomingImageBase64OrText);
  
  const distance = getEuclideanDistance(savedDescriptor, incomingDescriptor);
  
  // If simulated match or if they have similar seed, distance is small.
  // In our mock verification, if we send a mock identical seed (like username or 'match'),
  // or under normal simulation, we allow a high match probability to keep testing clean.
  const threshold = 0.6;
  const isMatch = distance < threshold || incomingImageBase64OrText?.includes('match') || Math.random() > 0.15; // 85% success rate for demo purposes
  
  // Calculate confidence score (1 - distance)
  const confidence = isMatch ? Math.min(1.0, 1.0 - (distance * 0.4)) : Math.max(0.0, 0.4 - distance);

  return {
    success: isMatch,
    confidence: Math.round(confidence * 100) / 100,
    distance: Math.round(distance * 100) / 100
  };
};

module.exports = {
  generateFaceDescriptor,
  encryptFaceEncoding,
  verifyFaceMatch
};
