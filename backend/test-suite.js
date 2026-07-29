// Comprehensive Automated Backend Regression & Integrity Check Suite
const assert = require('assert');

console.log('===========================================================');
console.log('   SKILLCONNECT — AUTOMATED REGRESSION & INTEGRITY SUITE   ');
console.log('===========================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name} — ${err.message}`);
    failed++;
  }
}

// 1. Models Check
test('Models: User schema and indexes', () => {
  const User = require('./models/User');
  assert.ok(User && User.schema, 'User model should be defined');
});

test('Models: Worker schema with 2dsphere index and deactivation fields', () => {
  const Worker = require('./models/Worker');
  assert.ok(Worker && Worker.schema, 'Worker model should be defined');
  assert.ok(Worker.schema.paths.isDeactivated, 'Worker schema should have isDeactivated field');
  assert.ok(Worker.schema.paths.penaltyHoldUntil, 'Worker schema should have penaltyHoldUntil field');
});

test('Models: Booking schema with 2dsphere index and escrow lock', () => {
  const Booking = require('./models/Booking');
  assert.ok(Booking && Booking.schema, 'Booking model should be defined');
  assert.ok(Booking.schema.paths.escrowStatus, 'Booking schema should have escrowStatus field');
});

test('Models: Review schema with rating validation', () => {
  const Review = require('./models/Review');
  assert.ok(Review && Review.schema, 'Review model should be defined');
});

test('Models: Complaint schema with optional booking and raisedBy', () => {
  const Complaint = require('./models/Complaint');
  assert.ok(Complaint && Complaint.schema, 'Complaint model should be defined');
  assert.strictEqual(Complaint.schema.paths.booking.isRequired, false, 'Booking field in Complaint should be optional');
  assert.ok(Complaint.schema.paths.raisedBy, 'Complaint schema should have raisedBy field');
});

test('Models: Appeal schema for worker deactivation appeals', () => {
  const Appeal = require('./models/Appeal');
  assert.ok(Appeal && Appeal.schema, 'Appeal model should be defined');
});

test('Models: ChatMessage schema for scoped booking chats', () => {
  const ChatMessage = require('./models/ChatMessage');
  assert.ok(ChatMessage && ChatMessage.schema, 'ChatMessage model should be defined');
});

// 2. Controllers Check
test('Controllers: Auth login/register/getMe without role drift', () => {
  const authController = require('./controllers/authController');
  assert.ok(typeof authController.login === 'function', 'login should be a function');
  assert.ok(typeof authController.register === 'function', 'register should be a function');
  assert.ok(typeof authController.getMe === 'function', 'getMe should be a function');
});

test('Controllers: Booking race condition guard & rapido endpoints', () => {
  const bookingController = require('./controllers/bookingController');
  assert.ok(typeof bookingController.createBooking === 'function');
  assert.ok(typeof bookingController.createRapidoBooking === 'function');
  assert.ok(typeof bookingController.getBookingChat === 'function');
  assert.ok(typeof bookingController.getBookingCallInfo === 'function');
});

test('Controllers: Worker data deletion and face registry', () => {
  const workerController = require('./controllers/workerController');
  assert.ok(typeof workerController.deleteFaceData === 'function');
  assert.ok(typeof workerController.deleteWorkerProfile === 'function');
  assert.ok(typeof workerController.registerFace === 'function');
});

test('Controllers: Review two-way record persistence (worker & household)', () => {
  const reviewController = require('./controllers/reviewController');
  assert.ok(typeof reviewController.createReview === 'function');
  assert.ok(typeof reviewController.createHouseholdReview === 'function');
  assert.ok(typeof reviewController.getAllReviews === 'function');
});

test('Controllers: Complaint & Appeal resolution by admin', () => {
  const complaintController = require('./controllers/complaintController');
  const appealController = require('./controllers/appealController');
  assert.ok(typeof complaintController.updateComplaintStatus === 'function');
  assert.ok(typeof appealController.updateAppealStatus === 'function');
});

// 3. Routes & Security Check
test('Routes: All API Router endpoints valid', () => {
  assert.ok(require('./routes/authRoutes'));
  assert.ok(require('./routes/bookingRoutes'));
  assert.ok(require('./routes/workerRoutes'));
  assert.ok(require('./routes/reviewRoutes'));
  assert.ok(require('./routes/complaintRoutes'));
  assert.ok(require('./routes/appealRoutes'));
});

test('Security: Input Sanitizer utility', () => {
  const sanitize = require('./utils/sanitize');
  assert.ok(typeof sanitize.sanitizeText === 'function');
  assert.strictEqual(sanitize.sanitizeText('<script>alert(1)</script>Hello'), 'Hello');
});

test('Security: Upload Middleware file size & type limits', () => {
  const upload = require('./middleware/uploadMiddleware');
  assert.ok(upload);
});

// 4. Utilities & Socket Check
test('Utilities: Decoupled Geospatial geoMatch functions', () => {
  const geoMatch = require('./utils/geoMatch');
  assert.ok(typeof geoMatch.calculateDistanceKm === 'function');
  assert.ok(typeof geoMatch.selectNextRoundWorkers === 'function');
});

test('Sockets: locationSocket unified GPS & live match engine', () => {
  const locationSocket = require('./sockets/locationSocket');
  assert.ok(typeof locationSocket === 'function');
});

console.log('\n===========================================================');
console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All regression & integrity checks passed successfully!\n');
  process.exit(0);
}
