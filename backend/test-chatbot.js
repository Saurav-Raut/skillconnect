/**
 * SkillConnect Chatbot System Test Suite
 * Verifies Mongoose schemas, intent classification, RAG lookup, and fallback template rendering.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();
process.env.NODE_ENV = 'test';

const KBChunk = require('./models/KBChunk');
const IntentRoute = require('./models/IntentRoute');
const ChatLog = require('./models/ChatLog');
const SupportTicket = require('./models/SupportTicket');


console.log('🏁 Starting SkillConnect Chatbot Integration Tests...');

async function runTests() {
  try {
    // Connect to separate test database to avoid clearing live FAQs
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/skillconnect_test');
    console.log('✅ MongoDB Connected to Test Database.');

    // Clear collections to force re-seeding of new intents and FAQs
    await KBChunk.deleteMany({});
    await IntentRoute.deleteMany({});
    console.log('✅ Temporary Collections Cleared.');

    // Import chatbotEngine after connection and await seeding explicitly
    const { processChatbotMessage, seedDefaultDataIfEmpty } = require('./utils/chatbotEngine');
    await seedDefaultDataIfEmpty();

    const mockSessionId = 'test_sess_' + Math.random().toString(36).substring(2, 10);

    // 1. Verify Seed Data Exists
    const chunkCount = await KBChunk.countDocuments();
    assert(chunkCount > 0, 'Database should contain seeded knowledge chunks');
    console.log(`✅ KBChunk Count verified: ${chunkCount} chunks present.`);

    const routeCount = await IntentRoute.countDocuments();
    assert(routeCount > 0, 'Database should contain seeded intent routes');
    console.log(`✅ IntentRoute Count verified: ${routeCount} routes mapped.`);

    // 2. Test Guest Household FAQ Query (English)
    console.log('\n--- Test Case 1: Household Safety Question (English) ---');
    const result1 = await processChatbotMessage({
      text: 'Is the worker verified and safe to enter my home?',
      userDoc: null,
      userRole: 'household',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result1.detectedIntent);
    console.log('Response:', result1.replyText);
    assert(result1.detectedLanguage === 'en', 'Should detect English language');
    assert(result1.escalate === false, 'Standard FAQ query should not escalate');
    console.log('✅ Test Case 1: PASS');

    // 3. Test Guest Worker Earnings Query (Hindi)
    console.log('\n--- Test Case 2: Worker Earnings Question (Hindi) ---');
    const result2 = await processChatbotMessage({
      text: 'मेरी कमाई और पैसे कब मिलेंगे?',
      userDoc: null,
      userRole: 'worker',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result2.detectedIntent);
    console.log('Response:', result2.replyText);
    assert(result2.detectedLanguage === 'hi', 'Should detect Hindi language');
    assert(result2.detectedIntent === 'check_earnings', 'Should detect check_earnings intent');
    assert(result2.routeButton !== null, 'Earnings query should return route redirect button');
    assert(result2.routeButton.route === '/earnings', 'Should point to earnings route');
    console.log('✅ Test Case 2: PASS');

    // 4. Test Escalation Intent Trigger
    console.log('\n--- Test Case 3: Customer Care Escalation ---');
    const result3 = await processChatbotMessage({
      text: 'connect me to a human support agent please, admin help',
      userDoc: null,
      userRole: 'household',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result3.detectedIntent);
    console.log('Escalate Flag:', result3.escalate);
    assert(result3.detectedIntent === 'escalation_request', 'Should resolve to escalation_request');
    assert(result3.escalate === true, 'Human request intent must trigger escalate: true');
    console.log('✅ Test Case 3: PASS');

    // 5. Test Booking Query (English)
    console.log('\n--- Test Case 4: How to book (English) ---');
    const result4 = await processChatbotMessage({
      text: 'how to book the worker',
      userDoc: null,
      userRole: 'household',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result4.detectedIntent);
    console.log('Response:', result4.replyText);
    assert(result4.detectedIntent === 'create_booking', 'Should detect create_booking intent');
    assert(result4.routeButton !== null, 'Booking query should return route redirect button');
    assert(result4.routeButton.route === '/search', 'Should point to search route');
    console.log('✅ Test Case 4: PASS');

    // 6. Test RAG Fallback Login Query (English)
    console.log('\n--- Test Case 5: RAG Fallback - Account Login (English) ---');
    const result5 = await processChatbotMessage({
      text: 'how to login as worker',
      userDoc: null,
      userRole: 'general',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result5.detectedIntent);
    console.log('Response:', result5.replyText);
    assert(result5.replyText.includes('To log into your account, click the Login button'), 'Should return account login FAQ content');
    console.log('✅ Test Case 5: PASS');

    // 7. Test RAG Fallback Login Query (Hindi)
    console.log('\n--- Test Case 6: RAG Fallback - Account Login (Hindi) ---');
    const result6 = await processChatbotMessage({
      text: 'लॉगिन कैसे करें',
      userDoc: null,
      userRole: 'general',
      sessionId: mockSessionId
    });

    console.log('Detected Intent:', result6.detectedIntent);
    console.log('Response:', result6.replyText);
    assert(result6.replyText.includes('अपने खाते में लॉग इन करने के लिए'), 'Should return Hindi account login FAQ content');
    console.log('✅ Test Case 6: PASS');

    console.log('\n🏆 All chatbot engine unit cases executed and PASSED successfully.');
  } catch (err) {
    console.error('❌ Chatbot Test Suite FAILED:', err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Closed Database Connection.');
    }
  }
}

runTests();
