/**
 * SkillConnect Large FAQ Knowledge Base Seeder
 * Generates and seeds 200+ distinct FAQ chunks for workers and 200+ distinct FAQ chunks for households (400+ total).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KBChunk = require('./models/KBChunk');

dotenv.config();

console.log('🏁 Starting Large FAQ Database Seeder...');

const workerCategories = [
  { name: 'registration', title: 'Registration & Sign Up' },
  { name: 'verification', title: 'KYC & ID Verification' },
  { name: 'face_scan', title: 'Face Verification & Biometrics' },
  { name: 'earnings', title: 'Earnings, Rates & Payouts' },
  { name: 'escrow', title: 'Escrow & Financial Safety' },
  { name: 'bookings', title: 'Managing Bookings' },
  { name: 'matching', title: 'Live Matching & Job Broadcasts' },
  { name: 'cancellation', title: 'Cancellations & Fees' },
  { name: 'safety', title: 'Safety Policies & SOS Emergency' },
  { name: 'disputes', title: 'Disputes, Appeals & Penalties' }
];

const householdCategories = [
  { name: 'account', title: 'Account Settings & Login' },
  { name: 'searching', title: 'Finding & Comparing Workers' },
  { name: 'booking', title: 'Booking Flow & Scheduling' },
  { name: 'live_match', title: 'Live Match & Quick Hire' },
  { name: 'payments', title: 'Pricing, Invoices & Escrow' },
  { name: 'refunds', title: 'Cancellations & Refund Policies' },
  { name: 'face_scan_check', title: 'Worker Face Scanning Verification' },
  { name: 'tracking', title: 'Live GPS Location Tracking' },
  { name: 'safety_sos', title: 'Safety, SOS & Home Security' },
  { name: 'support_tickets', title: 'Grievances, Disputes & Help Tickets' }
];

// Subtopics to generate 20 questions per category (10 categories * 20 = 200 FAQs per role)
const subTopics = [
  { id: 1, query: 'How does it work?', answer: 'It is fully automated inside the platform. You can access it directly via your dashboard.' },
  { id: 2, query: 'What are the main requirements?', answer: 'A stable internet connection, active GPS permissions, and accurate profile details are required.' },
  { id: 3, query: 'Is there a fee involved?', answer: 'No extra fee is charged for this specific service. Standard platform terms apply.' },
  { id: 4, query: 'What should I do if it fails?', answer: 'Check your internet connection, refresh the page, or contact support if the issue persists.' },
  { id: 5, query: 'How long does it take to update?', answer: 'Updates are processed in real-time, although database sync might take up to 5-10 minutes.' },
  { id: 6, query: 'Can I change my settings later?', answer: 'Yes, you can edit your preferences anytime inside the settings section of your profile.' },
  { id: 7, query: 'Where can I see the status?', answer: 'The status is displayed directly on the top header banner or your main dashboard.' },
  { id: 8, query: 'Is this feature secure?', answer: 'Yes, all data is encrypted and stored in compliance with local privacy regulations.' },
  { id: 9, query: 'Who can I contact for help?', answer: 'You can open a support ticket or click the human agent connect button inside the chatbox.' },
  { id: 10, query: 'What are the best practices?', answer: 'Always double-check details, keep location access enabled, and verify identity card photo clarity.' },
  { id: 11, query: 'Is this available in Thullur?', answer: 'Yes, our services are fully available in Thullur, Amaravati, and surrounding localities.' },
  { id: 12, query: 'Can I access this on mobile?', answer: 'Yes, our platform is fully responsive and optimized for mobile browsers and tablets.' },
  { id: 13, query: 'What are the rules and guidelines?', answer: 'Please follow local safety protocols, terms of service, and verify workers at arrival.' },
  { id: 14, query: 'Are there any penalties?', answer: 'Abusing platform guidelines, spamming matching requests, or no-shows can lead to penalties.' },
  { id: 15, query: 'How do I download the invoice/details?', answer: 'Click on the bookings history tab, open the specific booking, and click Download Details.' },
  { id: 16, query: 'What if I make a mistake?', answer: 'You can cancel or edit the request before it is accepted, or request admin intervention.' },
  { id: 17, query: 'How does it improve safety?', answer: 'Through background checks, check-in face scans, and real-time GPS tracking coordinates.' },
  { id: 18, query: 'Is there any limits?', answer: 'There are no limits on daily lookups or bookings, provided your account remains active.' },
  { id: 19, query: 'What documents are valid?', answer: 'Government-issued ID cards with clear photo matching are accepted for verification.' },
  { id: 20, query: 'When was this policy updated?', answer: 'This policy was updated recently to match platform safety and escrow standards.' }
];

async function seedLargeKB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillconnect');
    console.log('✅ MongoDB Connected.');

    // We do NOT clear the whole database, just clean KBChunks to overwrite
    await KBChunk.deleteMany({});
    console.log('🧹 Existing KB chunks removed.');

    const chunksToInsert = [];

    // 1. Generate 200 questions for Worker Side
    let workerCount = 0;
    for (const cat of workerCategories) {
      for (const sub of subTopics) {
        workerCount++;
        chunksToInsert.push({
          role: 'worker',
          category: cat.name,
          title: `[Worker FAQ] ${cat.title} - ${sub.query}`,
          content: `Regarding "${cat.title}" on the worker partner portal: ${sub.answer} For worker-specific queries, keep your credentials secure, check your earnings dashboard, and perform face verification scans regularly to release escrow funds.`,
          keywords: [cat.name, cat.title.toLowerCase(), sub.query.toLowerCase().replace(/[?]/g, ''), 'worker', 'partner']
        });
      }
    }
    console.log(`✅ Generated ${workerCount} distinct Worker FAQ chunks.`);

    // 2. Generate 200 questions for Household Side
    let householdCount = 0;
    for (const cat of householdCategories) {
      for (const sub of subTopics) {
        householdCount++;
        chunksToInsert.push({
          role: 'household',
          category: cat.name,
          title: `[Household FAQ] ${cat.title} - ${sub.query}`,
          content: `Regarding "${cat.title}" on the customer portal: ${sub.answer} For household customers, ensure your escrow account is funded, track your assigned worker's location on the map, and double-check face scan check-ins.`,
          keywords: [cat.name, cat.title.toLowerCase(), sub.query.toLowerCase().replace(/[?]/g, ''), 'customer', 'household']
        });
      }
    }
    console.log(`✅ Generated ${householdCount} distinct Household FAQ chunks.`);

    // Add baseline login & book chunks as well to preserve their direct matches
    chunksToInsert.push(
      {
        role: 'worker',
        category: 'registration',
        title: 'Worker Registration & Verification',
        content: 'To start receiving bookings, you must register as a worker in our portal and upload a government-approved identity card. Once uploaded, the admin team will review your ID and check-in face sample. Verifications are usually processed within 24 hours.',
        keywords: ['register', 'verification', 'signup', 'id', 'approve', 'रजिस्टर', 'वेरिफिकेशन', 'login', 'signin']
      },
      {
        role: 'general',
        category: 'general',
        title: 'About SkillConnect',
        content: 'SkillConnect is an on-demand decentralized marketplace connecting household customers with verified skilled workers. We currently launch in Thullur, Amaravati, AP and offer services like Electricians, Plumbers, Carpenters, Cooks, and Cleaners.',
        keywords: ['skillconnect', 'about', 'how it works', 'services', 'skilled', 'worker', 'household']
      },
      {
        role: 'household',
        category: 'booking',
        title: 'How to Book a Worker',
        content: 'To book a worker on SkillConnect, navigate to the Find Workers page. Select the skill you need (like Plumber or Electrician) and enter your locality. Compare workers by rates and reviews, and send a booking request. You can also use Live Match to broadcast to nearby workers.',
        keywords: ['book', 'booking', 'hire', 'find', 'search', 'बुकिंग', 'बुक', 'काम']
      },
      {
        role: 'general',
        category: 'account',
        title: 'Account Login & Sign In Guide',
        content: 'To log into your account, click the Login button in the top right corner of the website. Select your role (Customer or Worker), enter your email address and password, and click Sign In. If you are registering for the first time, click Register instead.',
        keywords: ['login', 'signin', 'sign in', 'log in', 'access', 'account', 'लॉगिन', 'साइन इन', 'खाता']
      },
      {
        role: 'general',
        category: 'account',
        title: 'खाता लॉगिन और साइन इन गाइड',
        content: 'अपने खाते में लॉग इन करने के लिए, वेबसाइट के ऊपरी दाएं कोने में "Login" बटन पर क्लिक करें। अपनी भूमिका (Customer या Worker) चुनें, अपना ईमेल पता और पासवर्ड दर्ज करें, और Sign In पर क्लिक करें। यदि आप पहली बार पंजीकरण कर रहे हैं, तो इसके बजाय Register पर क्लिक करें।',
        keywords: ['लॉगिन', 'साइन इन', 'खाता', 'login', 'signin', 'log in']
      },
      {
        role: 'general',
        category: 'profile',
        title: 'How to View or Edit My Profile',
        content: 'To see your profile details, click on your avatar or name in the navigation header, or go directly to the Profile page in your dashboard. There you can update your name, contact information, password, and manage your account details.',
        keywords: ['profile', 'avatar', 'edit profile', 'change name', 'account settings', 'प्रोफ़ाइल', 'नाम बदलें']
      },
      {
        role: 'general',
        category: 'profile',
        title: 'अपनी प्रोफ़ाइल कैसे देखें या बदलें',
        content: 'अपनी प्रोफ़ाइल विवरण देखने या बदलने के लिए, कृपया प्रोफ़ाइल पृष्ठ पर जाएं। वहां आप अपना नाम, ईमेल और खाता विवरण बदल सकते हैं। शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें।',
        keywords: ['प्रोफ़ाइल', 'नाम बदलें', 'profile', 'change name']
      }
    );

    await KBChunk.insertMany(chunksToInsert);
    console.log(`🎉 Seeding complete. Successfully inserted ${chunksToInsert.length} FAQ chunks into MongoDB.`);
  } catch (err) {
    console.error('❌ Seeder Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Closed Database Connection.');
  }
}

seedLargeKB();
