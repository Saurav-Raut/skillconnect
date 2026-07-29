const express = require('express');
const { register, login, requestOTP, verifyOTP, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-otp', protect, otpLimiter, requestOTP);
router.post('/verify-otp', protect, otpLimiter, verifyOTP);
router.get('/me', protect, getMe);

module.exports = router;
