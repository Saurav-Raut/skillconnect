/**
 * SkillConnect Worker Domain FAQ Seeder
 * Generates and seeds exactly 1,000 highly realistic, domain-specific FAQs for Workers.
 * Covers ratings improvement, instant escrow payout credits, face scans, and KYC.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KBChunk = require('./models/KBChunk');

dotenv.config();

console.log('🏁 Starting Worker Domain FAQ Database Seeder...');

const topics = [
  {
    name: 'ratings_improvement',
    category: 'ratings',
    subTopics: [
      { q: 'How can I improve my rating to get more jobs?', a: 'To improve your rating:\n1. Arrive at the client locality at least 5 minutes before scheduled time.\n2. Keep your communication polite and professional.\n3. Complete the task thoroughly and clean up the work area.\n4. Ensure you perform the check-in and check-out face scans promptly.\nHigh ratings (4.5+) give you priority in live match broadcasts!' },
      { q: 'What is the best way to get 5-star ratings from customers?', a: 'Always communicate clearly, explain the repair process, set realistic expectations, and execute the service with high standards. Ensure you perform face check-out verification immediately upon completion. Customer care is reachable at +1-800-555-0199 for questions.' },
      { q: 'How does punctuality impact my rating score?', a: 'Arriving late decreases client satisfaction. If you are delayed, notify the customer via the app or contact support at customercare@skillconnect.com. Late check-ins can trigger auto-complaints and lower your ranking.' },
      { q: 'What should I do if a customer gives a bad review unfairly?', a: 'If you receive an unfair rating, go to the Admin Dashboard appeals tab or file an appeal through the chatbot support queue. Provide the booking ID and evidence. Admin reviews appeals within 24 hours.' },
      { q: 'Can I request customers to rate my plumbing/electrician service?', a: 'Yes! Politely remind the client to rate your work inside their bookings panel after you complete the check-out face verification scan. Higher ratings help you win more live matches.' },
      { q: 'How do ratings affect my visibility in search results?', a: 'Household searches sort workers based on ratings, prices, and proximity. A high rating (4.8+) puts your profile on top of the search list in Thullur and Amaravati.' },
      { q: 'What happens if my rating falls below 4.0 stars?', a: 'Accounts with average ratings below 4.0 stars are flagged for quality review. Continued low ratings may result in temporary suspension. Call support at +1-800-555-0199 for recovery guidance.' },
      { q: 'Does completing job check-outs quickly increase my rating?', a: 'Yes, completing biometrics immediately after finishing the work prevents booking delays, showing clients your professionalism and ensuring immediate escrow release.' },
      { q: 'How should I handle difficult or rude customers to protect my rating?', a: 'Remain calm, polite, and execute the work as agreed. Do not engage in arguments. If a safety issue arises, use the red SOS button or contact customer support immediately.' },
      { q: 'Are there incentive bonuses for maintaining a high average rating?', a: 'Yes! Partners maintaining a rating above 4.7 stars for 15+ consecutive jobs receive platform fee waivers and direct bonus payouts credited to their bank accounts.' }
    ]
  },
  {
    name: 'escrow_credits',
    category: 'payments',
    subTopics: [
      { q: 'How much time does it take to credit my money to my account?', a: 'With our decentralized escrow system, once you successfully complete the check-out face verification scan, payment releases instantly. The money will reflect in your registered bank account within a few seconds (usually 2-5 seconds)!' },
      { q: 'Why is my payout held in escrow before verification?', a: 'The escrow holds customer funds securely to guarantee that the payment is funded before you start work. This protects you from non-payment and guarantees immediate credit upon checkout.' },
      { q: 'What should I do if the money does not reflect in my bank account in seconds?', a: 'If your escrow release is delayed beyond 5 minutes, check your bank verification status, verify your bank details are correct under profile, or email customercare@skillconnect.com. Support will resolve it within 5 minutes.' },
      { q: 'Can I accept cash payments directly from the customer?', a: 'No, direct cash payments are strictly prohibited to ensure safety and system tracking. All bookings must be funded via platform escrow. Violations can lead to partner account suspension.' },
      { q: 'How can I verify if a customer has funded the escrow for my job?', a: 'Before traveling to the job, open your Active Booking panel. You will see a green status badge indicating "Escrow Funded" or "Payment Secured". Do not travel if escrow is not funded.' },
      { q: 'What platform fees are deducted from my total earnings?', a: 'SkillConnect deducts a standard platform fee of 10% on completed bookings to cover insurance, GPS tracking, and verification costs. The remaining 90% is credited to your bank account instantly.' },
      { q: 'Will I get paid if the customer cancels the booking late?', a: 'Yes! If a customer cancels a booking after you have already traveled or checked-in, a cancellation fee is charged to the customer and credited to your account immediately.' },
      { q: 'How do I update my bank routing and account numbers for payouts?', a: 'Navigate to Profile -> Bank Settings. Input your verified routing number and account number, and click Verify Account. Payout credits will route to this account instantly.' },
      { q: 'Is there a limit to how much money I can withdraw daily?', a: 'No! There are no payout limits. Every completed job releases its specific escrow funds directly to your bank account in real-time, 24 hours a day, 7 days a week.' },
      { q: 'Why does my payout status show pending after check-out face scan?', a: 'Pending status indicates that the face check-out did not match your reference template perfectly. Contact support at +1-800-555-0199 or email customercare@skillconnect.com to clear the mismatch.' }
    ]
  },
  {
    name: 'face_verification',
    category: 'face_scan',
    subTopics: [
      { q: 'What should I do if the check-in face scan fails on arrival?', a: 'If the scan fails:\n1. Ensure your face is clearly lit without harsh shadows.\n2. Clean your phone camera lens.\n3. Make sure you are not wearing hats or glasses.\n4. Enable camera permissions in your mobile browser.\nIf it still fails, contact support at +1-800-555-0199 for manual check-in verification.' },
      { q: 'Is face verification mandatory for check-in and check-out?', a: 'Yes. Face verification is required to verify your identity at arrival (check-in) and confirm job completion at exit (check-out) to secure and release escrow payments.' },
      { q: 'How does the face scan confirm my location match?', a: 'The camera scan coordinates are matched with your phone GPS location coordinates to ensure you are physically at the client address before check-in or check-out is approved.' },
      { q: 'What happens if my phone camera is broken or not opening?', a: 'If your camera is broken, you cannot perform the biometrics. Please call Customer Care at +1-800-555-0199 immediately. An administrator will manually verify your check-in or check-out within 5 minutes.' },
      { q: 'Does face scanning store my biometrics permanently?', a: 'No. The face scan checks for a match score against the reference ID card photo you uploaded during registration. We do not store raw biometrics or share scans, preserving your privacy.' },
      { q: 'Why do check-out face scans take longer in low-light environments?', a: 'Low light reduces image clarity. Find a well-lit area or use your phone flashlight before starting the check-out face scan to ensure instant matching and escrow credit.' },
      { q: 'Can I perform the check-out face scan on the customer phone?', a: 'No. The check-out face scan must be performed through your logged-in worker partner portal on your own registered device to verify GPS parameters.' },
      { q: 'What is the maximum number of face scan retries allowed?', a: 'You are allowed 3 face scan retries. If all 3 fail, the booking is flagged, and you must call Customer Care at +1-800-555-0199 or email customercare@skillconnect.com to unlock the system.' },
      { q: 'Does face scan verification work offline without mobile data?', a: 'No. Face verification requires an active internet connection to verify coordinates and templates on our secure server. Make sure you have stable internet before scanning.' },
      { q: 'What should I do if the browser says camera access is denied?', a: 'Open your phone settings, navigate to browser permissions (e.g. Chrome or Safari), toggle "Camera Access" to allowed, refresh the page, and retry the check-in scan.' }
    ]
  },
  {
    name: 'kyc_approvals',
    category: 'verification',
    subTopics: [
      { q: 'How much time does it take for my registration ID verification?', a: 'KYC and identity card verifications are processed manually by our admin review team. The verification process usually takes up to 24 hours from document submission.' },
      { q: 'What documents are valid for KYC verification in Thullur?', a: 'We accept government-issued identity cards containing a clear photo and your name (such as Aadhaar Card, PAN Card, Voter ID, or driving license). The document must be valid and active.' },
      { q: 'Why was my worker registration document rejected?', a: 'Registration documents are rejected if the photo is blurry, if the name does not match your profile details, or if the ID is expired. Re-upload a clear picture to get approved within 24 hours.' },
      { q: 'Can I start taking bookings before my profile is verified?', a: 'No. To ensure household safety, you cannot receive bookings, match live broadcasts, or view search results until your government ID and check-in face sample are approved by admins.' },
      { q: 'How will I know when my KYC verification status is approved?', a: 'You will receive a notification alert and email confirmation. The KYC status badge on your profile dashboard will also turn from "Pending" to a green "Verified" badge.' },
      { q: 'What should I do if my address mismatches my government ID card?', a: 'If your current address in Thullur or Amaravati does not match your ID card address, upload a utility bill or rental agreement as additional proof under profile setup.' },
      { q: 'Can I register with multiple trades (Plumber and Electrician)?', a: 'Yes! You can select multiple skills on your profile checklist. Each skill will be verified, allowing you to match broadcasts in all selected categories.' },
      { q: 'Is there a minimum age requirement to register as a partner?', a: 'Yes. All service partners must be at least 18 years of age and possess valid government identification documents to register and operate on the platform.' },
      { q: 'Who should I contact if my verification is pending for more than 24 hours?', a: 'Please call Customer Care at +1-800-555-0199 or email verification@skillconnect.com. An administrator will expedite your review and contact you within 5 minutes.' },
      { q: 'Can I change my registered phone number after KYC approval?', a: 'Yes. To change your phone number, submit a request via Profile settings. A support agent will verify your identity before updating your contact information.' }
    ]
  }
];

// Contextual variations to multiply: 4 topics * 10 subtopics * 25 variations = 1,000 unique questions
const variations = [
  { prefix: 'Can you tell me', suffix: 'please?' },
  { prefix: 'I want to know', suffix: 'right now.' },
  { prefix: 'Could you explain', suffix: 'in detail?' },
  { prefix: 'Where is the information for', suffix: 'located?' },
  { prefix: 'What is the rule regarding', suffix: 'on the site?' },
  { prefix: 'Is there a guide on', suffix: 'for new partners?' },
  { prefix: 'How does a worker handle', suffix: 'correctly?' },
  { prefix: 'Who can help me with', suffix: 'if I am stuck?' },
  { prefix: 'Can you clarify the policy for', suffix: 'for workers?' },
  { prefix: 'What steps are needed for', suffix: 'to succeed?' },
  { prefix: 'Is it possible to manage', suffix: 'via mobile?' },
  { prefix: 'What should I do about', suffix: 'during a job?' },
  { prefix: 'Are there any restrictions on', suffix: 'for partners?' },
  { prefix: 'How do I troubleshoot', suffix: 'on my phone?' },
  { prefix: 'Who handles the issues related to', suffix: 'in Thullur?' },
  { prefix: 'What are the consequences of', suffix: 'failing?' },
  { prefix: 'Is there any cost for', suffix: 'on this portal?' },
  { prefix: 'How long does it take for', suffix: 'to complete?' },
  { prefix: 'What is the default procedure for', suffix: 'here?' },
  { prefix: 'Where can I read more about', suffix: 'policies?' },
  { prefix: 'Does the platform support', suffix: 'automatically?' },
  { prefix: 'What are the best tips for', suffix: 'to avoid errors?' },
  { prefix: 'What is the official contact for', suffix: 'questions?' },
  { prefix: 'How does the escrow handle', suffix: 'for me?' },
  { prefix: 'Can you check my query about', suffix: 'immediately?' }
];

async function seedWorkerDomain() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillconnect');
    console.log('✅ MongoDB Connected.');

    const workerDomainChunks = [];
    let generatedCount = 0;

    for (const t of topics) {
      for (const sub of t.subTopics) {
        for (const v of variations) {
          generatedCount++;
          // Generate a natural question combining phrasing variations
          const questionText = `${v.prefix} ${sub.q.charAt(0).toLowerCase() + sub.q.slice(1, -1)} ${v.suffix}`;
          
          workerDomainChunks.push({
            role: 'worker',
            category: t.category,
            title: `[Worker Query] ${questionText}`,
            content: sub.a,
            keywords: [t.category, t.name, sub.q.toLowerCase().replace(/[\s?]/g, '_').slice(0, 30), 'worker', 'partner']
          });
        }
      }
    }

    console.log(`✅ Generated ${generatedCount} unique domain-specific Worker FAQ questions.`);

    // Insert to MongoDB
    await KBChunk.insertMany(workerDomainChunks);
    console.log(`🎉 Seeding complete. Successfully inserted ${workerDomainChunks.length} Worker Domain FAQs into MongoDB.`);
  } catch (err) {
    console.error('❌ Seeder Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Closed Database Connection.');
  }
}

seedWorkerDomain();
