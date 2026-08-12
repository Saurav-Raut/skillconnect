const KBChunk = require('../models/KBChunk');
const IntentRoute = require('../models/IntentRoute');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Household = require('../models/Household');

// Local training/keyword classifier map for intent detection
const INTENT_KEYWORDS = {
  view_profile: ['profile', 'avatar', 'edit profile', 'change name', 'account settings', 'प्रोफ़ाइल', 'विवरण'],
  create_booking: ['book', 'booking', 'hire', 'find worker', 'find a worker', 'बुक कैसे करें', 'बुकिंग कैसे', 'हायर', 'काम चाहिए', 'काम', 'नौकरी'],
  track_order: ['track', 'status', 'where is my', 'active booking', 'booking status', 'order', 'स्थिति', 'ट्रैक'],
  cancel_booking: ['cancel', 'terminate', 'stop booking', 'delete booking', 'रद्द', 'कैंसिल'],
  check_earnings: ['earnings', 'salary', 'payout', 'money', 'payment', 'income', 'rate', 'कमाई', 'पैसे', 'सैलरी'],
  register_as_worker: ['register', 'join as worker', 'become partner', 'worker signup', 'signup', 'नौकरी', 'पार्टनर', 'रजिस्टर'],
  raise_complaint: ['complain', 'report', 'bad service', 'fraud', 'grievance', 'complaint', 'शिकायत', 'शिकायत दर्ज'],
  payment_issue: ['refund', 'double payment', 'charge', 'price', 'failed payment', 'escrow payment', 'रिफंड', 'भुगतान'],
  escalation_request: ['human', 'agent', 'talk to person', 'admin', 'customer care', 'support', 'अधिकारी', 'एजेंट', 'कॉल', 'मदद']
};

/**
 * Seed basic KB chunks and routes if they don't exist
 */
const seedDefaultDataIfEmpty = async () => {
  try {
    const chunkCount = await KBChunk.countDocuments();
    if (chunkCount === 0) {
      console.log('[Chatbot Engine] Seeding default FAQ knowledge base chunks...');
      const defaultChunks = [
        {
          role: 'household',
          category: 'safety',
          title: 'SkillConnect Safety Policies',
          content: 'At SkillConnect, safety is our top priority. Every worker undergoes an ID match and a verified police background check. During the booking, workers are required to perform a check-in face scan on arrival and a check-out face scan before leaving. You can also track their live GPS location in the app. If you feel unsafe, press the red SOS button to notify local emergency services and our admin team.',
          keywords: ['safety', 'secure', 'police', 'safe', 'sos', 'security', 'सुरक्षा']
        },
        {
          role: 'household',
          category: 'payments',
          title: 'Escrow Payment System',
          content: 'SkillConnect uses an escrow payment system. When a worker accepts your booking, your payment is held securely in escrow. The payment is only released to the worker once they successfully complete the job and perform the checkout face verification. This ensures you only pay for completed work.',
          keywords: ['payment', 'escrow', 'money', 'refund', 'charge', 'pay', 'भुगतान', 'पैसे']
        },
        {
          role: 'worker',
          category: 'payments',
          title: 'Worker Earnings and Payouts',
          content: 'As a SkillConnect partner, your earnings are protected by our escrow system. Once the customer funds the escrow, your payment is guaranteed. The funds are automatically released to your registered account immediately after you complete the checkout face verification. You can view your total earnings under the Earnings tab.',
          keywords: ['earnings', 'payout', 'salary', 'bank', 'transfer', 'rate', 'पैसे', 'कमाई']
        },
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
      ];
      await KBChunk.insertMany(defaultChunks);
      console.log('[Chatbot Engine] KB chunks seeded successfully.');
    }

    const routeCount = await IntentRoute.countDocuments();
    if (routeCount === 0) {
      console.log('[Chatbot Engine] Seeding default Intent-to-Route maps...');
      const defaultRoutes = [
        { intentName: 'register_as_worker', route: '/register', buttonLabel: 'Register as Worker' },
        { intentName: 'track_order', route: '/track-booking', buttonLabel: 'Track Active Booking' },
        { intentName: 'raise_complaint', route: '/grievances', buttonLabel: 'File a Safety Report' },
        { intentName: 'check_earnings', route: '/earnings', buttonLabel: 'View Earnings Dashboard' },
        { intentName: 'payment_issue', route: '/my-bookings', buttonLabel: 'View Bookings & Payments' },
        { intentName: 'create_booking', route: '/search', buttonLabel: 'Find Workers' },
        { intentName: 'view_profile', route: '/profile', buttonLabel: 'Go to Profile' }
      ];
      await IntentRoute.insertMany(defaultRoutes);
      console.log('[Chatbot Engine] Intent routes seeded successfully.');
    }
  } catch (err) {
    console.error('[Chatbot Engine] Seeding error:', err.message);
  }
};

// Execute seeding check on load
if (process.env.NODE_ENV !== 'test') {
  seedDefaultDataIfEmpty();
}

/**
 * Clean & normalize text for simple language analysis
 */
const cleanText = (text) => {
  return (text || '').toLowerCase().trim();
};

/**
 * Detect query language
 */
const detectLanguage = (text) => {
  const hindiKeywords = ['है', 'हूँ', 'कहाँ', 'कैसे', 'बुकिंग', 'पैसे', 'कमाई', 'कैंसिल', 'रद्द', 'मदद'];
  const lowercase = text.toLowerCase();
  for (const k of hindiKeywords) {
    if (lowercase.includes(k)) return 'hi';
  }
  // Default to English
  return 'en';
};

/**
 * Simple local classifier for intent detection
 */
const classifyIntentLocal = (text) => {
  const lowercase = text.toLowerCase();
  let bestIntent = 'fallback';
  let maxScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lowercase.includes(kw)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }
  return { intent: bestIntent, score: maxScore };
};

/**
 * Perform simple RAG search in MongoDB (keyword match + text search fallback)
 */
const getRAGContext = async (queryText, userRole) => {
  const lowercase = queryText.toLowerCase();
  const searchRoles = [userRole, 'general'];
  const allRoles = ['household', 'worker', 'general', 'admin'];

  // 1. Try role-specific text index search
  try {
    let chunks = await KBChunk.find(
      { role: { $in: searchRoles }, $text: { $search: queryText } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(2);

    if (chunks && chunks.length > 0) {
      return chunks;
    }
  } catch (err) {
    // Ignore text search errors if index is building
  }

  // 2. Try global text index search (cross-role fallback)
  try {
    let chunks = await KBChunk.find(
      { role: { $in: allRoles }, $text: { $search: queryText } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(2);

    if (chunks && chunks.length > 0) {
      return chunks;
    }
  } catch (err) {
    // Ignore
  }

  // 3. Fallback: role-specific keyword match
  const tokens = lowercase.split(/\s+/).filter(t => t.length > 2);
  let chunks = await KBChunk.find({
    role: { $in: searchRoles },
    keywords: { $in: tokens }
  }).limit(2);

  if (chunks && chunks.length > 0) {
    return chunks;
  }

  // 4. Fallback: global keyword match (cross-role fallback)
  chunks = await KBChunk.find({
    role: { $in: allRoles },
    keywords: { $in: tokens }
  }).limit(2);

  return chunks;
};

/**
 * Fetch real-time database details for Live Data intents
 */
const fetchLiveData = async (intent, userDoc, userRole) => {
  if (!userDoc) return null;

  try {
    if (userRole === 'worker') {
      const workerProfile = await Worker.findOne({ user: userDoc._id });
      if (!workerProfile) return null;

      if (intent === 'check_earnings') {
        const completedBookings = await Booking.find({ worker: workerProfile._id, status: 'completed' });
        const totalAmount = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        return {
          role: 'worker',
          ratePerHour: workerProfile.ratePerHour,
          completedJobsCount: completedBookings.length,
          totalEarnings: totalAmount,
          idVerificationStatus: workerProfile.idVerificationStatus
        };
      }
      
      if (intent === 'track_order') {
        const latestJob = await Booking.findOne({ worker: workerProfile._id }).sort('-createdAt').populate({ path: 'household', populate: { path: 'user' } });
        if (!latestJob) return null;
        return {
          role: 'worker',
          bookingId: latestJob._id,
          status: latestJob.status,
          customerName: latestJob.household?.user?.name || 'Household Customer',
          totalAmount: latestJob.totalAmount,
          date: latestJob.date
        };
      }
    } else if (userRole === 'household') {
      const householdProfile = await Household.findOne({ user: userDoc._id });
      if (!householdProfile) return null;

      if (intent === 'track_order' || intent === 'payment_issue') {
        const latestBooking = await Booking.findOne({ household: householdProfile._id }).sort('-createdAt').populate({ path: 'worker', populate: { path: 'user' } });
        if (!latestBooking) return null;
        return {
          role: 'household',
          bookingId: latestBooking._id,
          status: latestBooking.status,
          workerName: latestBooking.worker?.user?.name || 'Assigned Worker',
          totalAmount: latestBooking.totalAmount,
          date: latestBooking.date,
          escrowStatus: latestBooking.escrowStatus
        };
      }
    }
  } catch (err) {
    console.error('[Chatbot Engine] Live data error:', err.message);
  }
  return null;
};

/**
 * Main engine controller to compile chatbot response
 */
const processChatbotMessage = async ({ text, userDoc, userRole, sessionId }) => {
  const language = detectLanguage(text);
  const cleanInput = cleanText(text);

  // 1. Detect Intent
  let detectedIntent = 'fallback';
  let intentScore = 0;

  // Option A/B check for API keys (e.g. Gemini)
  if (process.env.GEMINI_API_KEY) {
    try {
      const classificationPrompt = `You are a classifier. Classify this user query into exactly one of these intents:
[track_order, cancel_booking, check_earnings, register_as_worker, raise_complaint, payment_issue, escalation_request, fallback].
Return ONLY the intent name in plain text, with no formatting, punctuation or quotes.

User Query: "${text}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: classificationPrompt }] }] })
        }
      );
      const resJson = await response.json();
      const geminiIntent = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase();
      if (geminiIntent && INTENT_KEYWORDS[geminiIntent]) {
        detectedIntent = geminiIntent;
        intentScore = 10; // high confidence
      }
    } catch (err) {
      console.warn('[Chatbot Engine] Gemini intent classification failed, falling back to keyword parser:', err.message);
    }
  }

  if (detectedIntent === 'fallback') {
    const classification = classifyIntentLocal(cleanInput);
    detectedIntent = classification.intent;
    intentScore = classification.score;
  }

  // 2. Fetch Live Database Details
  const liveData = await fetchLiveData(detectedIntent, userDoc, userRole);

  // 3. Retrieve FAQ Context (RAG)
  const kbContextChunks = await getRAGContext(text, userRole);
  const kbText = kbContextChunks.map(c => `[FAQ: ${c.title}] ${c.content}`).join('\n');

  // 4. Look up Intent Route Button mapping
  let routeButton = null;
  const routeMapping = await IntentRoute.findOne({ intentName: detectedIntent });
  if (routeMapping) {
    let finalRoute = routeMapping.route;
    if (liveData && liveData.bookingId) {
      finalRoute = `${routeMapping.route}/${liveData.bookingId}`;
    }
    routeButton = {
      route: finalRoute,
      label: routeMapping.buttonLabel
    };
  }

  // 5. Check Escalation Status
  const shouldEscalate = detectedIntent === 'escalation_request';

  // 6. Build Final Response
  let replyText = '';

  // API LLM execution
  if (process.env.GEMINI_API_KEY) {
    try {
      const synthesisPrompt = `You are a helpful and polite customer support AI assistant for SkillConnect, a decentralized marketplace.
Role of the user you are talking to: ${userRole || 'Guest'}.
Language: You MUST respond in the same language the user queried in (English, Hindi, or Hinglish).
Constraints: Keep your response concise (under 3-4 sentences). Do NOT hallucinate. Use ONLY the provided context and live database data to answer.

[CONTEXT FAQs]
${kbText || 'No FAQ context available.'}

[LIVE DATABASE DETAILS]
${liveData ? JSON.stringify(liveData) : 'No live database records found for this query.'}

User Query: "${text}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: synthesisPrompt }] }] })
        }
      );
      const resJson = await response.json();
      replyText = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    } catch (err) {
      console.warn('[Chatbot Engine] Gemini synthesis failed, using local templates:', err.message);
    }
  }

  // Fallback to local template-based responses
  if (!replyText) {
    let matchedChunkText = '';
    // Only fetch RAG FAQ matches if we failed to identify a specific intent
    if (detectedIntent === 'fallback' && kbContextChunks && kbContextChunks.length > 0) {
      const hiChunk = kbContextChunks.find(c => c.title.match(/[\u0900-\u097F]/) || c.content.match(/[\u0900-\u097F]/));
      const enChunk = kbContextChunks.find(c => !c.title.match(/[\u0900-\u097F]/) && !c.content.match(/[\u0900-\u097F]/));
      if (language === 'hi' && hiChunk) {
        matchedChunkText = hiChunk.content;
      } else if (language === 'en' && enChunk) {
        matchedChunkText = enChunk.content;
      } else {
        matchedChunkText = kbContextChunks[0].content;
      }
    }

    if (language === 'hi') {
      // Hindi Responses
      if (detectedIntent === 'track_order') {
        if (liveData) {
          replyText = `आपकी बुकिंग (ID: ${liveData.bookingId}) की वर्तमान स्थिति है: "${liveData.status}"। कुल भुगतान राशि ₹${liveData.totalAmount} है। विवरण देखने के लिए नीचे दिए गए बटन पर क्लिक करें।`;
        } else {
          replyText = `अपनी बुकिंग विवरण को ट्रैक करने के लिए, कृपया अपने खाते में लॉग इन करें और बुकिंग की स्थिति देखें। हमारा प्लेटफ़ॉर्म प्रत्येक बुकिंग के लिए रीयल-टाइम जीपीएस ट्रैकिंग प्रदान करता है।`;
        }
      } else if (detectedIntent === 'check_earnings') {
        if (liveData) {
          replyText = `आपकी कुल प्रमाणित कमाई ₹${liveData.totalEarnings} है। आपने ${liveData.completedJobsCount} काम पूरे किए हैं। आपका प्रति घंटा शुल्क ₹${liveData.ratePerHour} है। विवरण देखने के लिए नीचे दिए गए बटन पर क्लिक करें।`;
        } else {
          replyText = `एक पंजीकृत भागीदार के रूप में, आप अपने डैशबोर्ड में अपनी कमाई देख सकते हैं। ग्राहक द्वारा सत्यापन पूरा करने के बाद स्किलकनेक्ट सीधे बैंक खाते में भुगतान जारी करता है।`;
        }
      } else if (detectedIntent === 'create_booking') {
        replyText = `एक सत्यापित कार्यकर्ता (Worker) को बुक करने के लिए, कृपया 'Find Workers' खोज पृष्ठ पर जाएं। अपने क्षेत्र और आवश्यकता के अनुसार कार्यकर्ता खोजें। शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें।`;
      } else if (detectedIntent === 'view_profile') {
        replyText = `अपनी प्रोफ़ाइल विवरण देखने या बदलने के लिए, कृपया प्रोफ़ाइल पृष्ठ पर जाएं। वहां आप अपना नाम, ईमेल और खाता विवरण बदल सकते हैं। शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें।`;
      } else if (detectedIntent === 'register_as_worker') {
        replyText = `स्किलकनेक्ट में कार्यकर्ता (Worker) के रूप में शामिल होने के लिए, आपको पंजीकरण करना होगा और अपना सरकारी पहचान पत्र अपलोड करना होगा। कृपया पंजीकरण फॉर्म भरने के लिए नीचे दिए गए बटन पर क्लिक करें।`;
      } else if (detectedIntent === 'raise_complaint') {
        replyText = `यदि आपको काम, भुगतान या सुरक्षा से संबंधित कोई समस्या है, तो आप शिकायत दर्ज कर सकते हैं। कृपया हमारी सुरक्षा टीम को रिपोर्ट भेजने के लिए नीचे दिए गए बटन का उपयोग करें।`;
      } else if (detectedIntent === 'escalation_request' || shouldEscalate) {
        replyText = `हम आपको एक मानव सहायता एजेंट से जोड़ रहे हैं। एक सपोर्ट टिकट (ID: ${sessionId.slice(0, 8)}) खोल दिया गया है। तुरंत सहायता के लिए, कृपया कस्टमर केयर को +1-800-555-0199 पर कॉल करें या customercare@skillconnect.com पर ईमेल करें। एक प्रतिनिधि 5 मिनट के भीतर आपसे संपर्क करेगा। असुविधा के लिए खेद है!`;
      } else if (matchedChunkText) {
        replyText = matchedChunkText;
      } else {
        replyText = `नमस्ते! मैं स्किलकनेक्ट का एआई सहायक हूँ। मैं सुरक्षा नीतियों, भुगतान और बुकिंग में आपकी सहायता कर सकता हूँ। क्या आप मुझे बता सकते हैं कि आपको किस प्रकार की सहायता चाहिए?\n\nतुरंत सहायता के लिए, कृपया कस्टमर केयर को +1-800-555-0199 पर कॉल करें या customercare@skillconnect.com पर ईमेल करें। एक प्रतिनिधि 5 मिनट के भीतर आपसे संपर्क करेगा। असुविधा के लिए खेद है!`;
      }
    } else {
      // English Responses
      if (detectedIntent === 'track_order') {
        if (liveData) {
          replyText = `Your active booking (ID: ${liveData.bookingId}) is currently in status: "${liveData.status}". The total payment amount is ₹${liveData.totalAmount}. Click the button below to track details.`;
        } else {
          replyText = `To track your booking details, please log into your account and view the active booking status. Our platform provides real-time GPS tracking and face scan verification for every booking.`;
        }
      } else if (detectedIntent === 'check_earnings') {
        if (liveData) {
          replyText = `Your total verified earnings to date are ₹${liveData.totalEarnings} across ${liveData.completedJobsCount} completed jobs. Your current rate is ₹${liveData.ratePerHour}/hour. Click the button below to open your earnings dashboard.`;
        } else {
          replyText = `As a registered partner, you can check your earnings in the partner dashboard. SkillConnect pays directly to your bank account via escrow once the customer completes verification.`;
        }
      } else if (detectedIntent === 'create_booking') {
        replyText = `To book a verified service partner on SkillConnect, navigate to the Find Workers search page. Select the trade and your location, pick a worker, and book them. Click the button below to start searching.`;
      } else if (detectedIntent === 'view_profile') {
        replyText = `To view or edit your profile details, navigate to the Profile page. There you can update your name, email, password, and other account settings. Click the button below to open your profile.`;
      } else if (detectedIntent === 'register_as_worker') {
        replyText = `To register as a service partner on SkillConnect, you need to sign up and upload a government-issued ID card. Click the button below to navigate to the registration form.`;
      } else if (detectedIntent === 'raise_complaint') {
        replyText = `If you have experienced an issue with service safety, workers, or customer interactions, you can file a complaint. Click the button below to reach the support team.`;
      } else if (detectedIntent === 'escalation_request' || shouldEscalate) {
        replyText = `Connecting you to a human agent... A support ticket (Session ID: ${sessionId.slice(0, 8)}) has been created in our escalation queue. An administrator will reply shortly. For urgent support, call Customer Care at +1-800-555-0199 or email customercare@skillconnect.com and an agent will reach you within 5 minutes. Sorry for the inconvenience!`;
      } else if (matchedChunkText) {
        replyText = matchedChunkText;
      } else {
        replyText = `Hello! I am your SkillConnect support assistant. I can help with safety rules, payments, earnings, or booking tracking. What can I do for you today?\n\nIf you need urgent assistance, please call Customer Care at +1-800-555-0199 or email customercare@skillconnect.com and a support representative will reach you within 5 minutes. Sorry for the inconvenience!`;
      }
    }
  }

  return {
    replyText,
    detectedIntent,
    detectedLanguage: language,
    routeButton,
    escalate: shouldEscalate
  };
};

module.exports = {
  processChatbotMessage,
  seedDefaultDataIfEmpty
};
