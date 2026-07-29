export const API_BASE_URL = (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL)
  ? ((process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL).endsWith('/api')
    ? (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL)
    : `${process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL}/api`)
  : 'https://skillconnect-backend-97u2.onrender.com/api';

export const SKILL_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Daily Laborer',
  'Cook',
  'Cleaner'
];

export const MOCK_BOT_RESPONSES = {
  en: [
    "Welcome to SkillConnect! I can help you register, book a trusted worker, or understand our dual face verification safety measures.",
    "For emergency security assistance, you can click the floating SOS button on your booking tracking screen. It alerts nearby units immediately.",
    "We verify worker credentials (police checks) and secure all payments in escrow before the worker checks in with face recognition.",
    "Do you want me to search for local Electricians or Plumbers?"
  ],
  hi: [
    "स्किलकनेक्ट में आपका स्वागत है! मैं आपको पंजीकरण करने, विश्वसनीय कामगार को खोजने या चेहरे के सत्यापन की सुरक्षा को समझने में मदद कर सकता हूँ।",
    "आपातकालीन सहायता के लिए, ट्रैकिंग स्क्रीन पर एस ओ एस बटन दबाएं। यह तुरंत सुरक्षा टीम को सूचित करता है।",
    "हम सभी कामगारों की पुलिस जांच और पहचान की पुष्टि करते हैं। भुगतान सुरक्षित एस्क्रो में रखा जाता है।",
    "क्या आप चाहते हैं कि मैं आपके क्षेत्र में बिजली मिस्त्री या नलसाज की खोज करूँ?"
  ],
  ta: [
    "SkillConnect-க்கு உங்களை வரவேற்கிறோம்! உங்களுக்கு தகுதியான பணியாளர்களை கண்டறிய அல்லது எங்களின் முக சரிபார்ப்பு பாதுகாப்பை புரிந்து கொள்ள நான் உங்களுக்கு உதவ முடியும்.",
    "அவசரகால உதவிக்கு, SOS பொத்தானை அழுத்தவும். இது உடனடியாக பாதுகாப்புப் பிரிவினரை எச்சரிக்கும்.",
    "நாங்கள் பணியாளர்களின் அடையாளங்களை சரிபார்க்கிறோம். நீங்கள் செலுத்தும் தொகை பாதுகாப்பாக எஸ்க்ரோவில் வைக்கப்படும்."
  ],
  te: [
    "SkillConnect కి స్వాగతం! నమ్మకమైన కార్మికులను కనుగొనడంలో మరియు మీ భద్రతా ఫేస్ వెరిఫికేషన్ వివరాలను అర్థం చేసుకోవడంలో నేను మీకు సహాయపడతాను.",
    "అత్యవసర సహాయం కొరకు, SOS బటన్‌ను నొక్కండి. ఇది వెంటనే రక్షణ బృందాన్ని అలర్ట్ చేస్తుంది."
  ]
};

export const FAQ_DATA = {
  book: {
    q: { en: "How to book?", hi: "बुक कैसे करें?", ta: "எப்படி முன்பதிவு செய்வது?", te: "ఎలా బుక్ చేయాలి?" },
    a: {
      en: "1. Go to 'Find Workers' page.\n2. Filter by the skill you need.\n3. Click 'View Profile' and select a date.\n4. Pay into Escrow to confirm.",
      hi: "1. 'फाइंड वर्कर्स' पेज पर जाएं।\n2. आवश्यक कौशल चुनें।\n3. 'व्यू प्रोफाइल' पर क्लिक करें और तारीख चुनें।\n4. पुष्टि करने के लिए एस्क्रो में भुगतान करें।",
      ta: "1. 'Find Workers' பக்கத்திற்கு செல்லவும்.\n2. திறனைத் தேர்ந்தெடுக்கவும்.\n3. தேதியைத் தேர்ந்தெடுத்து எஸ்க்ரோவில் செலுத்தவும்.",
      te: "1. 'Find Workers' పేజీకి వెళ్లండి.\n2. నైపుణ్యాన్ని ఎంచుకోండి.\n3. తేదీని ఎంచుకుని ఎస్క్రోలో చెల్లించండి."
    }
  },
  face: {
    q: { en: "Face verification security", hi: "चेहरा सत्यापन सुरक्षा", ta: "முக சரிபார்ப்பு பாதுகாப்பு", te: "ఫేస్ వెరిఫికేషన్ సెక్యూరిటీ" },
    a: {
      en: "1. Open Live Tracking when worker arrives.\n2. Click 'Manage' and use your camera to scan their face.\n3. System matches it against their verified ID.\n4. Only upon match is check-in approved.",
      hi: "1. कामगार के आने पर लाइव ट्रैकिंग खोलें।\n2. उनका चेहरा स्कैन करें।\n3. सिस्टम उनकी सत्यापित आईडी से मेल खाता है।\n4. मेल खाने पर ही चेक-इन स्वीकृत होता है।",
      ta: "1. தொழிலாளி வரும்போது லைவ் டிராக்கிங்கைத் திறக்கவும்.\n2. அவர்கள் முகத்தை ஸ்கேன் செய்யவும்.\n3. அடையாளம் சரிபார்க்கப்படும்.",
      te: "1. కార్మికుడు వచ్చినప్పుడు లైవ్ ట్రాకింగ్ తెరవండి.\n2. వారి ముఖాన్ని స్కాన్ చేయండి.\n3. గుర్తింపు ధృవీకరించబడుతుంది."
    }
  },
  pay: {
    q: { en: "Payment & Escrow", hi: "भुगतान और एस्क्रो", ta: "கட்டணம் & எஸ்க்ரோ", te: "చెల్లింపు & ఎస్క్రో" },
    a: {
      en: "1. Your money is held safely in an Escrow account.\n2. The worker only gets paid after you scan their face again at Check-Out.\n3. If there is a dispute, funds are frozen until resolved.",
      hi: "1. आपका पैसा एस्क्रो खाते में सुरक्षित रखा जाता है।\n2. चेक-आउट पर स्कैन करने के बाद ही कामगार को भुगतान मिलता है।\n3. विवाद होने पर धन रोक दिया जाता है।",
      ta: "1. உங்கள் பணம் எஸ்க்ரோ கணக்கில் பாதுகாப்பாக வைக்கப்பட்டுள்ளது.\n2. வேலை முடிந்தவுடன் தொழிலாளிக்கு பணம் கிடைக்கும்.",
      te: "1. మీ డబ్బు ఎస్క్రో ఖాతాలో సురక్షితంగా ఉంచబడుతుంది.\n2. పని పూర్తయిన తర్వాత కార్మికుడికి చెల్లించబడుతుంది."
    }
  }
};

export const MOCK_TUTORIAL_VIDEOS = [
  {
    id: 1,
    title: 'How to use Dual Face Verification (Hindi)',
    duration: '2:15',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Ensuring your safety with Escrow & SOS Checks (English)',
    duration: '1:45',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];
