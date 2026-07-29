/**
 * Zero-dependency in-memory rate limiter middleware for authentication routes.
 * Protects login, register, and OTP endpoints from brute force and DoS attacks.
 */

const ipRequestCounts = new Map();

// Periodic cleanup of expired IP timestamps every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now > data.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}, 15 * 60 * 1000);

const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 50, message = 'Too many requests from this IP, please try again after 15 minutes.' } = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!ipRequestCounts.has(ip)) {
      ipRequestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const record = ipRequestCounts.get(ip);

    // If window expired, reset count
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    // Increment request count
    record.count += 1;

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    next();
  };
};

module.exports = {
  authLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many auth requests, please try again in 15 minutes.' }),
  otpLimiter: createRateLimiter({ windowMs: 5 * 60 * 1000, max: 10, message: 'Too many OTP requests, please try again in 5 minutes.' })
};
