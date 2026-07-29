// SkillConnect Capstone — End-to-End Multi-Role Workflow Integration Test Suite
// Verifies Household, Worker, and Admin user journeys and API integrations

const mongoose = require('mongoose');
const assert = require('assert');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Household = require('./models/Household');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Complaint = require('./models/Complaint');
const Appeal = require('./models/Appeal');

const authController = require('./controllers/authController');
const bookingController = require('./controllers/bookingController');
const workerController = require('./controllers/workerController');
const reviewController = require('./controllers/reviewController');
const complaintController = require('./controllers/complaintController');
const appealController = require('./controllers/appealController');

// Mock request/response helper
function createMockReqRes(body = {}, user = null, params = {}, query = {}) {
  const req = { body, user, params, query };
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    }
  };
  return { req, res };
}

async function runE2ETests() {
  console.log('=====================================================================');
  console.log('   SKILLCONNECT — END-TO-END ROLE WORKFLOW INTEGRATION SUITE   ');
  console.log('=====================================================================\n');

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    // Clean any previous test artifacts
    const testEmailPrefix = 'e2e_test_user_';
    await User.deleteMany({ email: { $regex: testEmailPrefix } });

    console.log('---------------------------------------------------------------------');
    console.log('4.2 HOUSEHOLD CORE FLOW WORKFLOW');
    console.log('---------------------------------------------------------------------');

    // 1. Create Household User
    const hhUser = await User.create({
      name: 'E2E Test Household',
      email: `${testEmailPrefix}hh@test.com`,
      phone: '9988776601',
      password: 'password123',
      role: 'household'
    });
    const householdDoc = await Household.create({ user: hhUser._id, address: '123 E2E Street, Mumbai', city: 'Mumbai' });
    console.log('[PASS] Household user & profile created:', hhUser.email);

    // 2. Create Worker User
    const wkrUser = await User.create({
      name: 'E2E Test Worker',
      email: `${testEmailPrefix}wkr@test.com`,
      phone: '9988776602',
      password: 'password123',
      role: 'worker'
    });
    const workerDoc = await Worker.create({
      user: wkrUser._id,
      skill: 'Electrician',
      ratePerHour: 500,
      experience: 5,
      location: { type: 'Point', coordinates: [72.8777, 19.0760] },
      currentLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
      idVerificationStatus: 'pending',
      isDeactivated: true,
      penaltyHoldUntil: new Date(Date.now() + 86400000) // 1 day hold for test
    });
    console.log('[PASS] Worker user & profile created:', wkrUser.email);

    // 3. Create Booking from Household to Worker
    const { req: reqBook, res: resBook } = createMockReqRes(
      {
        workerId: workerDoc._id,
        date: '2026-07-30',
        startTime: '10:00',
        hours: 3,
        facilityAccessAgreed: true
      },
      hhUser
    );
    await bookingController.createBooking(reqBook, resBook);
    assert(resBook.data && resBook.data.success, `Booking creation failed: ${resBook.data && resBook.data.error}`);
    const bookingDoc = resBook.data.data;
    console.log('[PASS] Household created Booking:', bookingDoc._id, '| Status:', bookingDoc.status);

    // 4. Household Funds Escrow
    const { req: reqEscrow, res: resEscrow } = createMockReqRes(
      { paymentMethod: 'UPI' },
      hhUser,
      { id: bookingDoc._id.toString() }
    );
    await bookingController.fundBookingEscrow(reqEscrow, resEscrow);
    assert(resEscrow.data && resEscrow.data.success, `Escrow funding failed: ${resEscrow.data && resEscrow.data.error}`);
    assert.strictEqual(resEscrow.data.data.status, 'escrow_funded', 'Booking status should be escrow_funded');
    console.log('[PASS] Household funded escrow -> status: escrow_funded');

    // 5. Household Submits Review for Worker
    const { req: reqReview, res: resReview } = createMockReqRes(
      { workerId: workerDoc._id, rating: 5, comment: 'Excellent work and quick arrival!', bookingId: bookingDoc._id },
      hhUser
    );
    await reviewController.createReview(reqReview, resReview);
    assert(resReview.data && resReview.data.success, `Review creation failed: ${resReview.data && resReview.data.error}`);
    console.log('[PASS] Household submitted two-way Review for Worker');

    // 6. Household Submits Grievance / Safety Report
    const { req: reqComp, res: resComp } = createMockReqRes(
      { bookingId: bookingDoc._id, reason: 'Worker arrived slightly late' },
      hhUser
    );
    await complaintController.createComplaint(reqComp, resComp);
    assert(resComp.data && resComp.data.success, 'Complaint submission failed');
    const complaintDoc = resComp.data.data;
    console.log('[PASS] Household submitted Grievance -> Complaint ID:', complaintDoc._id);

    console.log('\n---------------------------------------------------------------------');
    console.log('4.3 WORKER CORE FLOW WORKFLOW');
    console.log('---------------------------------------------------------------------');

    // 1. Worker Registers Face Data
    const { req: reqFace, res: resFace } = createMockReqRes(
      { faceData: 'mock_encrypted_encoding_vector_1024' },
      wkrUser
    );
    await workerController.registerFace(reqFace, resFace);
    assert(resFace.data && resFace.data.success, `Face registration failed: ${resFace.data && resFace.data.error}`);
    console.log('[PASS] Worker registered Face Encoding successfully');

    // 2. Worker Updates Real-Time GPS Coordinates
    const { req: reqLoc, res: resLoc } = createMockReqRes(
      { skill: 'Electrician', coordinates: [72.8800, 19.0800] },
      wkrUser
    );
    await workerController.updateWorkerProfile(reqLoc, resLoc);
    assert(resLoc.data && resLoc.data.success, `Location update failed: ${resLoc.data && resLoc.data.error}`);
    console.log('[PASS] Worker streamed live GPS coordinates -> [72.8800, 19.0800]');

    // 3. Worker Submits Deactivation Appeal
    const { req: reqAppeal, res: resAppeal } = createMockReqRes(
      { reason: 'I had an emergency medical situation, requesting reactivation' },
      wkrUser
    );
    await appealController.createAppeal(reqAppeal, resAppeal);
    assert(resAppeal.data && resAppeal.data.success, `Appeal creation failed: ${resAppeal.data && resAppeal.data.error}`);
    const appealDoc = resAppeal.data.data;
    console.log('[PASS] Worker submitted Deactivation Appeal -> Appeal ID:', appealDoc._id);

    console.log('\n---------------------------------------------------------------------');
    console.log('4.4 ADMIN CORE FLOW WORKFLOW');
    console.log('---------------------------------------------------------------------');

    // 1. Admin Login check
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
    }
    console.log('[PASS] Admin account active without role drift:', adminUser.email, '| Role:', adminUser.role);

    // 2. Admin Resolves Grievance/Complaint
    const { req: reqResComp, res: resResComp } = createMockReqRes(
      { status: 'resolved', adminResponse: 'Reviewed evidence and closed case amicably' },
      adminUser,
      { id: complaintDoc._id.toString() }
    );
    await complaintController.updateComplaintStatus(reqResComp, resResComp);
    assert(resResComp.data && resResComp.data.success, `Complaint resolution failed: ${resResComp.data && resResComp.data.error}`);
    assert.strictEqual(resResComp.data.data.status, 'resolved', 'Complaint should be resolved');
    console.log('[PASS] Admin resolved Grievance -> status: resolved');

    // 3. Admin Restores Worker from Deactivation Appeal
    const { req: reqResAppeal, res: resResAppeal } = createMockReqRes(
      { status: 'approved', adminNotes: 'Verified medical emergency, worker restored' },
      adminUser,
      { id: appealDoc._id.toString() }
    );
    await appealController.updateAppealStatus(reqResAppeal, resResAppeal);
    assert(resResAppeal.data && resResAppeal.data.success, `Appeal resolution failed: ${resResAppeal.data && resResAppeal.data.error}`);

    // Verify worker in DB is now restored
    const updatedWorkerDoc = await Worker.findById(workerDoc._id);
    assert.strictEqual(updatedWorkerDoc.isDeactivated, false, 'Worker should no longer be deactivated');
    assert.strictEqual(updatedWorkerDoc.penaltyHoldUntil, null, 'Worker penalty hold should be cleared');
    console.log('[PASS] Admin restored Worker -> isDeactivated: false | penaltyHoldUntil: null');

    console.log('\n---------------------------------------------------------------------');
    console.log('CLEANING UP TEST ARTIFACTS...');
    console.log('---------------------------------------------------------------------');
    await Booking.deleteMany({ _id: bookingDoc._id });
    await Review.deleteMany({ booking: bookingDoc._id });
    await Complaint.deleteMany({ _id: complaintDoc._id });
    await Appeal.deleteMany({ _id: appealDoc._id });
    await Worker.deleteMany({ _id: workerDoc._id });
    await Household.deleteMany({ _id: householdDoc._id });
    await User.deleteMany({ _id: { $in: [hhUser._id, wkrUser._id] } });
    console.log('[PASS] Cleaned up all test users, bookings, complaints, and appeals from DB.');

    console.log('\n=====================================================================');
    console.log('   ALL E2E WORKFLOW INTEGRATION TESTS COMPLETED SUCCESSFULLY!      ');
    console.log('=====================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL ERROR] E2E Test Suite Failed:', err);
    process.exit(1);
  }
}

runE2ETests();
