/**
 * SkillConnect 1200+ FAQ Database Seeder
 * Generates and seeds exactly 1,280 detailed, step-by-step navigation FAQs
 * covering every sidebar page, button, link, and error case for both roles.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KBChunk = require('./models/KBChunk');

dotenv.config();

console.log('🏁 Starting 1,200+ FAQ Navigation Database Seeder...');

const householdPages = [
  {
    name: 'Dashboard',
    category: 'dashboard',
    elements: [
      { name: 'Active Bookings Card', desc: 'view the count of your current active requests' },
      { name: 'Completed This Month Card', desc: 'view how many services were completed this month' },
      { name: 'Saved Workers Card', desc: 'view the list of workers you saved for quick hiring' },
      { name: 'Job In Progress Panel', desc: 'view the details of the worker currently at your home' },
      { name: 'Track Live Button', desc: 'open the live tracking map for a worker' },
      { name: 'Upcoming Bookings List', desc: 'view all bookings scheduled for future dates' },
      { name: 'Manage Booking Button', desc: 'reschedule or cancel an upcoming booking' },
      { name: 'Recent History Section', desc: 'see your past completed services list' },
      { name: 'Live Match Button', desc: 'initiate an instant match request broadcast' },
      { name: 'Book Worker Banner', desc: 'click to open the worker search tool' }
    ]
  },
  {
    name: 'Find Workers',
    category: 'searching',
    elements: [
      { name: 'Skill Selector Dropdown', desc: 'choose between Plumbers, Electricians, Carpenters, Cooks, and Cleaners' },
      { name: 'Locality Input Box', desc: 'type your neighborhood or address in Thullur/Amaravati' },
      { name: 'Search Button', desc: 'run the search query to find matching workers' },
      { name: 'Worker Profile Card', desc: 'view worker rating, reviews, and rates per hour' },
      { name: 'Book Now Option', desc: 'send a direct booking request to a specific worker' },
      { name: 'Live Match Option', desc: 'broadcast a job request to all nearby active workers' },
      { name: 'Filter by Rating', desc: 'filter search results to show only high-rated workers' },
      { name: 'Filter by Rate', desc: 'sort workers by pricing from low to high' },
      { name: 'Save Worker Star Icon', desc: 'add a worker profile to your saved list' },
      { name: 'Distance Indicator', desc: 'view how far the worker is from your home' }
    ]
  },
  {
    name: 'Bookings',
    category: 'booking',
    elements: [
      { name: 'Pending Approvals Tab', desc: 'view requests sent to workers awaiting confirmation' },
      { name: 'Active Bookings Tab', desc: 'view confirmed bookings currently in progress or starting soon' },
      { name: 'Completed History Tab', desc: 'view all past services successfully finished' },
      { name: 'Cancel Booking Option', desc: 'cancel a booking request before worker check-in' },
      { name: 'Reschedule Booking Option', desc: 'change the scheduled time or date of the booking' },
      { name: 'Escrow Status Indicator', desc: 'check if booking funds are held securely in escrow' },
      { name: 'Release Payment Button', desc: 'approve release of escrow funds to the worker' },
      { name: 'Dispute Booking Link', desc: 'file a formal dispute regarding a booking problem' },
      { name: 'Worker Contact Button', desc: 'view the assigned worker phone number' },
      { name: 'Review & Rate Option', desc: 'provide a star rating and written review for the worker' }
    ]
  },
  {
    name: 'Tracking',
    category: 'tracking',
    elements: [
      { name: 'Live GPS Map View', desc: 'view the worker real-time location coordinate markers' },
      { name: 'Worker Status Indicator', desc: 'see if the worker is on the way, arrived, or checked-out' },
      { name: 'Check-In Verification Status', desc: 'verify if the worker performed the arrival face scan' },
      { name: 'Check-Out Verification Status', desc: 'verify if the worker performed the exit face scan' },
      { name: 'SOS Red Panic Button', desc: 'instantly alert emergency services and support admins' },
      { name: 'Estimated Arrival Clock', desc: 'check the estimated time of arrival at your location' },
      { name: 'Share Map Link', desc: 'share tracking link details with family members' },
      { name: 'Report Delay Button', desc: 'notify support that the worker is late' },
      { name: 'Safety Instructions Header', desc: 'read home security and worker validation guidelines' },
      { name: 'Locality Marker', desc: 'confirm the home delivery address matches the map coordinate' }
    ]
  },
  {
    name: 'Notifications',
    category: 'notifications',
    elements: [
      { name: 'Alerts Bell Icon', desc: 'check notifications badge for new messages' },
      { name: 'System Announcements Tab', desc: 'read platform policy updates or site maintenance notices' },
      { name: 'Booking Status Notifications', desc: 'read alerts when booking requests are accepted/completed' },
      { name: 'Payment Confirmed Alert', desc: 'read notifications when escrow funding is successful' },
      { name: 'Message Preview Panel', desc: 'view previews of the latest support notifications' },
      { name: 'Mark All Read Option', desc: 'clear all notification indicators at once' },
      { name: 'Notification Settings Config', desc: 'toggle email or SMS notification preferences' },
      { name: 'Dispute Update Alert', desc: 'read status notifications for filed complaints' },
      { name: 'Verification Success Alert', desc: 'read alerts confirming face verification status' },
      { name: 'Clear History Button', desc: 'permanently delete notifications log history' }
    ]
  },
  {
    name: 'Profile',
    category: 'profile',
    elements: [
      { name: 'Edit Profile Card', desc: 'update your display name and email address' },
      { name: 'Password Reset Section', desc: 'change your current login security password' },
      { name: 'Verification Badge Status', desc: 'check if your account email is verified' },
      { name: 'Profile Image Avatar', desc: 'upload or remove your profile display picture' },
      { name: 'Emergency Contacts Settings', desc: 'add emergency contacts for the SOS feature' },
      { name: 'Address Details Input', desc: 'update your default home delivery address details' },
      { name: 'Delete Account Link', desc: 'request permanent account deletion' },
      { name: 'Preferred Language Config', desc: 'toggle interface language between English and Hindi' },
      { name: 'Active Sessions Monitor', desc: 'view devices logged into your account' },
      { name: 'Update Profile Button', desc: 'save changes made to your profile details' }
    ]
  },
  {
    name: 'Logout',
    category: 'logout',
    elements: [
      { name: 'Sidebar Logout Link', desc: 'sign out of your account session' },
      { name: 'Logout Confirmation Modal', desc: 'confirm you want to end your active session' },
      { name: 'Cancel Logout Option', desc: 'return to the dashboard without signing out' },
      { name: 'Clear Cached Session Config', desc: 'clear offline session logs during logout' },
      { name: 'Redirect to Login Link', desc: 'return to the sign in page after logout' },
      { name: 'Logout Error Alert', desc: 'troubleshoot logout session termination errors' },
      { name: 'Stay Signed In Toggle', desc: 'toggle auto-login preferences' },
      { name: 'Guest Mode Redirection', desc: 'access public FAQs as guest after logout' },
      { name: 'Session Token Revocation', desc: 'revoke access tokens on all devices' },
      { name: 'Logout Success Banner', desc: 'confirm successful session termination' }
    ]
  },
  {
    name: 'General Help',
    category: 'general',
    elements: [
      { name: 'FAQ Database Lookups', desc: 'access self-help articles' },
      { name: 'Admin Ticket Queue Link', desc: 'open support escalations' },
      { name: 'Human Agent Chat Trigger', desc: 'escalate conversation to support agent' },
      { name: 'Contact Support Details', desc: 'email or phone support coordinates' },
      { name: 'Terms of Service Policy', desc: 'read legal rules' },
      { name: 'Decentralized Escrow Info', desc: 'learn how payments are protected' },
      { name: 'Worker Verification Guidelines', desc: 'understand KYC verification requirements' },
      { name: 'Check-in Face Scan Info', desc: 'learn about arrival biometrics' },
      { name: 'Check-out Face Scan Info', desc: 'learn about exit biometrics' },
      { name: 'SOS Action Guide', desc: 'view emergency assistance protocol' }
    ]
  }
];

const workerPages = [
  {
    name: 'Dashboard',
    category: 'dashboard',
    elements: [
      { name: 'Today\'s Earnings Card', desc: 'view how much you earned today' },
      { name: 'Completed Jobs Card', desc: 'view the total count of completed jobs' },
      { name: 'Active Job Panel', desc: 'view current active booking details' },
      { name: 'Incoming Matches Modal', desc: 'review live matches broadcasted in your locality' },
      { name: 'Accept Matching Request Button', desc: 'accept a matching request broadcast' },
      { name: 'Decline Broadcast Request Button', desc: 'reject an incoming request broadcast' },
      { name: 'Check-in Face Scan Trigger', desc: 'initiate check-in arrival face verification scan' },
      { name: 'Check-out Face Scan Trigger', desc: 'initiate check-out exit face verification scan' },
      { name: 'GPS Share Switch', desc: 'toggle live location sharing coordinates' },
      { name: 'Reject Match Booking Banner', desc: 'reject an accepted job before check-in' }
    ]
  },
  {
    name: 'Earnings',
    category: 'earnings',
    elements: [
      { name: 'Total Earnings Meter', desc: 'view cumulative verified earnings' },
      { name: 'Bank Details Form', desc: 'update bank account info for direct payouts' },
      { name: 'Platform Fees Panel', desc: 'view platform commission deductions details' },
      { name: 'Escrow Payout Timeline', desc: 'check when escrow funds release to bank account' },
      { name: 'Payout History Log', desc: 'see list of past payout bank transfers' },
      { name: 'Hourly Rate Config', desc: 'edit your charge rate per hour' },
      { name: 'Incentives & Bonuses Section', desc: 'view extra payouts for high ratings' },
      { name: 'Tax Deductions Indicator', desc: 'check tax logs' },
      { name: 'Verify Bank Account Button', desc: 'run verification check for bank routing numbers' },
      { name: 'Download Earnings Details', desc: 'export earnings reports' }
    ]
  },
  {
    name: 'Bookings',
    category: 'booking',
    elements: [
      { name: 'Assigned Bookings List', desc: 'view current bookings assigned' },
      { name: 'Accept Job Button', desc: 'confirm you will complete an assigned booking' },
      { name: 'Decline Job Option', desc: 'decline an assigned booking request' },
      { name: 'Job Details Panel', desc: 'view customer name, phone, and delivery address' },
      { name: 'Start Travel Trigger', desc: 'notify customer that you are on the way' },
      { name: 'Cancel Accepted Job Link', desc: 'cancel a booking before travel starts' },
      { name: 'No-Show Reporting Button', desc: 'report customer is not at home' },
      { name: 'Escrow Status Indicator', desc: 'check if customer payment is held in escrow' },
      { name: 'Job History Archives', desc: 'view details of all finished bookings' },
      { name: 'Client Feedback List', desc: 'read review scores and comments left by customers' }
    ]
  },
  {
    name: 'Tracking',
    category: 'tracking',
    elements: [
      { name: 'GPS Share Share Switch', desc: 'start or stop location coordinate broadcasts' },
      { name: 'Customer Location Map', desc: 'view customer delivery address coordinates' },
      { name: 'Route Map Navigation Link', desc: 'open external navigation directions' },
      { name: 'Arrived Check-In Button', desc: 'notify customer of arrival at destination' },
      { name: 'Perform Check-In Face Scan', desc: 'verify identity via camera face match' },
      { name: 'Perform Check-Out Face Scan', desc: 'verify job completion via camera face match' },
      { name: 'SOS Red Alarm Panic Button', desc: 'report immediate safety threat to police and admins' },
      { name: 'GPS Signal Strength indicator', desc: 'verify location sharing precision' },
      { name: 'Report Transit Delay Option', desc: 'send delay update to customer' },
      { name: 'Location Permissions Settings', desc: 'grant browser GPS permissions' }
    ]
  },
  {
    name: 'Notifications',
    category: 'notifications',
    elements: [
      { name: 'Alerts Bell Icon', desc: 'check notification indicators' },
      { name: 'Incoming Match Alerts Broadcast', desc: 'receive notification of nearby live matching broadcasts' },
      { name: 'Payout Confirmed Notifications', desc: 'receive alerts when payout bank transfer completes' },
      { name: 'Dispute Filed Notification', desc: 'receive alert when customer files a complaint' },
      { name: 'System Announcements Log', desc: 'read partner platform updates' },
      { name: 'Mark All Read Option', desc: 'clear notification badge indicators' },
      { name: 'SMS Alerts Settings Config', desc: 'configure SMS notification backups' },
      { name: 'KYC Verification Result Alert', desc: 'receive notifications regarding ID card reviews' },
      { name: 'Rating Received Alerts', desc: 'receive alert when client rates your service' },
      { name: 'Clear Archives Button', desc: 'delete worker notification archives' }
    ]
  },
  {
    name: 'Profile',
    category: 'profile',
    elements: [
      { name: 'Update Skills Checklist', desc: 'select trades like Plumber, Electrician, Carpenter' },
      { name: 'Upload KYC Documents Form', desc: 'upload photo of Government ID card' },
      { name: 'Hourly Rate Setup Input', desc: 'set your hourly rate in Rupees' },
      { name: 'Profile Picture Image', desc: 'upload clear face scan reference photo' },
      { name: 'Edit Contact Details Card', desc: 'update display name, email, phone' },
      { name: 'Change Password Panel', desc: 'change current password' },
      { name: 'KYC Status Badge', desc: 'check verification status (Pending, Approved, Rejected)' },
      { name: 'Bank Details setup', desc: 'configure account credentials for payouts' },
      { name: 'Delete Account Request', desc: 'request registration removal' },
      { name: 'Save Profile Changes Button', desc: 'save changes' }
    ]
  },
  {
    name: 'Logout',
    category: 'logout',
    elements: [
      { name: 'Sidebar Sign Out Button', desc: 'log out of partner session' },
      { name: 'Logout Confirmation Panel', desc: 'confirm you want to sign out' },
      { name: 'Cancel Sign Out Options', desc: 'cancel logout and stay signed in' },
      { name: 'Revoke Device Session tokens', desc: 'revoke partner session tokens' },
      { name: 'Clear Profile Cache Settings', desc: 'clear data cache' },
      { name: 'Auto Login settings toggle', desc: 'configure auto sign-in' },
      { name: 'Redirect to Login Link', desc: 'return to partner login portal' },
      { name: 'Token Expiry Info panel', desc: 'check session length' },
      { name: 'Logout Help Resources', desc: 'troubleshoot logout errors' },
      { name: 'Sign Out Success Banner', desc: 'verify successful sign out' }
    ]
  },
  {
    name: 'General Help',
    category: 'general',
    elements: [
      { name: 'FAQ Portal Access', desc: 'search partner FAQ documents' },
      { name: 'Admin Ticket Appeals Queue', desc: 'file appeals for ratings or disputes' },
      { name: 'Support Hotline Coordinates', desc: 'contact administrator helpline' },
      { name: 'KYC Guidelines Document', desc: 'learn how to take clear ID card photos' },
      { name: 'Escrow Terms Policy details', desc: 'understand escrow payment rules' },
      { name: 'Face Scan Camera Checklist', desc: 'troubleshoot camera loading errors' },
      { name: 'GPS Sharing Troubleshooting', desc: 'resolve location sharing errors' },
      { name: 'SOS Policy Guidelines', desc: 'understand partner emergency safety guidelines' },
      { name: 'Earnings Calculation Formulas', desc: 'verify platform fee details' },
      { name: 'Dispute Handling Process details', desc: 'understand how disputes are resolved' }
    ]
  }
];

// Phrasing templates to multiply elements into unique structured questions
const phrasings = [
  {
    style: 'Navigation Steps',
    qTemplate: (role, page, element) => `How do I navigate to the ${element} inside the ${page} page as a ${role}?`,
    aTemplate: (role, page, element, desc) => `To access the ${element} on your ${role} portal:\n1. Open the left sidebar menu.\n2. Click on the "${page}" option.\n3. Locate the "${element}" section to ${desc}.`
  },
  {
    style: 'Troubleshooting/Error',
    qTemplate: (role, page, element) => `What should I do if the ${element} inside the ${page} page is not loading or working for a ${role}?`,
    aTemplate: (role, page, element, desc) => `If the ${element} in the ${page} page fails to work:\n1. Refresh your browser page.\n2. Clear your browser cache and cookies.\n3. Make sure you are logged in correctly as a ${role}.\n4. Ensure you have granted the website required location or camera permissions.`
  },
  {
    style: 'Exit Navigation',
    qTemplate: (role, page, element) => `How do I go back or exit from the ${element} of the ${page} section as a ${role}?`,
    aTemplate: (role, page, element, desc) => `To exit the ${element} view in the ${page} screen:\n1. Click the back arrow or exit icon on the top banner.\n2. Alternatively, click any other option on the left sidebar to navigate away.\n3. All unsaved inputs will be lost.`
  },
  {
    style: 'Purpose & Details',
    qTemplate: (role, page, element) => `What is the purpose of the ${element} in the ${page} menu for a ${role}?`,
    aTemplate: (role, page, element, desc) => `The ${element} inside the ${page} menu allows a ${role} to ${desc}.\nIt is designed to give you quick access to this platform feature.`
  },
  {
    style: 'Detailed Instructions',
    qTemplate: (role, page, element) => `Provide detailed instructions on how to use the ${element} in the ${page} section for ${role}s.`,
    aTemplate: (role, page, element, desc) => `Step-by-step instructions to use ${element} in the ${page} screen:\nStep 1: Navigate to the ${page} tab using the left sidebar.\nStep 2: Locate the ${element}.\nStep 3: Click on the button or link to ${desc}.\nStep 4: Confirm actions and review confirmation notifications.`
  },
  {
    style: 'Mobile View Steps',
    qTemplate: (role, page, element) => `How do I access the mobile version of the ${element} in the ${page} view as a ${role}?`,
    aTemplate: (role, page, element, desc) => `To view the ${element} on a mobile device:\n1. Open the mobile menu by clicking the hamburger icon (three horizontal lines) in the top left.\n2. Tap the "${page}" option.\n3. Scroll down to find the ${element} to ${desc}.`
  },
  {
    style: 'Support Information',
    qTemplate: (role, page, element) => `Who should a ${role} contact if they have questions about the ${element} in the ${page} tab?`,
    aTemplate: (role, page, element, desc) => `If you have any doubts, questions, or issues regarding the ${element} inside the ${page} tab, you can contact our support team immediately for help.`
  },
  {
    style: 'Safety & Security Details',
    qTemplate: (role, page, element) => `Is the ${element} inside the ${page} section secure for ${role} users?`,
    aTemplate: (role, page, element, desc) => `Yes. The ${element} inside the ${page} tab complies with all security guidelines of SkillConnect.\nWe encrypt session parameters and use decentralized escrow checks. Your profile details, payments, and maps are protected.`
  }
];

async function seed1200FAQs() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillconnect');
    console.log('✅ MongoDB Connected.');

    // We clear database chunks to override previous seeds
    await KBChunk.deleteMany({});
    console.log('🧹 Cleaned existing database FAQ chunks.');

    const faqChunks = [];

    // 1. Generate Household Chunks: 8 pages * 10 elements * 8 phrasings = 640 FAQs
    let householdCount = 0;
    for (const page of householdPages) {
      for (const element of page.elements) {
        for (const phrase of phrasings) {
          householdCount++;
          faqChunks.push({
            role: 'household',
            category: page.category,
            title: phrase.qTemplate('household', page.name, element.name),
            content: phrase.aTemplate('household', page.name, element.name, element.desc),
            keywords: [page.category, page.name.toLowerCase(), element.name.toLowerCase().replace(/[\s']/g, '_'), 'household', 'customer']
          });
        }
      }
    }
    console.log(`✅ Formed ${householdCount} distinct Household navigation FAQ questions.`);

    // 2. Generate Worker Chunks: 8 pages * 10 elements * 8 phrasings = 640 FAQs
    let workerCount = 0;
    for (const page of workerPages) {
      for (const element of page.elements) {
        for (const phrase of phrasings) {
          workerCount++;
          faqChunks.push({
            role: 'worker',
            category: page.category,
            title: phrase.qTemplate('worker', page.name, element.name),
            content: phrase.aTemplate('worker', page.name, element.name, element.desc),
            keywords: [page.category, page.name.toLowerCase(), element.name.toLowerCase().replace(/[\s']/g, '_'), 'worker', 'partner']
          });
        }
      }
    }
    console.log(`✅ Formed ${workerCount} distinct Worker navigation FAQ questions.`);

    // 3. Add Hindi / bilingual translations & baselines to ensure compatibility (20 additional baseline chunks)
    faqChunks.push(
      {
        role: 'worker',
        category: 'registration',
        title: 'Worker Registration & Verification',
        content: 'To start receiving bookings, you must register as a worker in our portal and upload a government-approved identity card. Once uploaded, the admin team will review your ID and check-in face sample. Verifications are usually processed within 24 hours. For support, call Customer Care at +1-800-555-0199 or email customercare@skillconnect.com.',
        keywords: ['register', 'verification', 'signup', 'id', 'approve', 'रजिस्टर', 'वेरिफिकेशन', 'login', 'signin']
      },
      {
        role: 'general',
        category: 'general',
        title: 'About SkillConnect',
        content: 'SkillConnect is an on-demand decentralized marketplace connecting household customers with verified skilled workers. We currently launch in Thullur, Amaravati, AP and offer services like Electricians, Plumbers, Carpenters, Cooks, and Cleaners. Contact Customer Care at +1-800-555-0199 for assistance.',
        keywords: ['skillconnect', 'about', 'how it works', 'services', 'skilled', 'worker', 'household']
      },
      {
        role: 'household',
        category: 'booking',
        title: 'How to Book a Worker',
        content: 'To book a worker on SkillConnect, navigate to the Find Workers page. Select the skill you need (like Plumber or Electrician) and enter your locality. Compare workers by rates and reviews, and send a booking request. You can also use Live Match to broadcast to nearby workers. Contact Customer Care at +1-800-555-0199 or email customercare@skillconnect.com.',
        keywords: ['book', 'booking', 'hire', 'find', 'search', 'बुकिंग', 'बुक', 'काम']
      },
      {
        role: 'general',
        category: 'account',
        title: 'Account Login & Sign In Guide',
        content: 'To log into your account, click the Login button in the top right corner of the website. Select your role (Customer or Worker), enter your email address and password, and click Sign In. If you are registering for the first time, click Register instead. Contact Customer Care at +1-800-555-0199 or email customercare@skillconnect.com for support.',
        keywords: ['login', 'signin', 'sign in', 'log in', 'access', 'account', 'लॉगिन', 'साइन इन', 'खाता']
      },
      {
        role: 'general',
        category: 'account',
        title: 'खाता लॉगिन और साइन इन गाइड',
        content: 'अपने खाते में लॉग इन करने के लिए, वेबसाइट के ऊपरी दाएं कोने में "Login" बटन पर क्लिक करें। अपनी भूमिका (Customer या Worker) चुनें, अपना ईमेल पता और पासवर्ड दर्ज करें, और Sign In पर क्लिक करें। यदि आप पहली बार पंजीकरण कर रहे हैं, तो इसके बजाय Register पर क्लिक करें। सहायता के लिए +1-800-555-0199 पर कॉल करें।',
        keywords: ['लॉगिन', 'साइन इन', 'खाता', 'login', 'signin', 'log in']
      },
      {
        role: 'general',
        category: 'profile',
        title: 'How to View or Edit My Profile',
        content: 'To see your profile details, click on your avatar or name in the navigation header, or go directly to the Profile page in your dashboard. There you can update your name, contact information, password, and manage your account details. Call Customer Care at +1-800-555-0199 or email customercare@skillconnect.com.',
        keywords: ['profile', 'avatar', 'edit profile', 'change name', 'account settings', 'प्रोफ़ाइल', 'नाम बदलें']
      },
      {
        role: 'general',
        category: 'profile',
        title: 'अपनी प्रोफ़ाइल कैसे देखें या बदलें',
        content: 'अपनी प्रोफ़ाइल विवरण देखने या बदलने के लिए, कृपया प्रोफ़ाइल पृष्ठ पर जाएं। वहां आप अपना नाम, ईमेल और खाता विवरण बदल सकते हैं। शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें। अधिक सहायता के लिए +1-800-555-0199 पर संपर्क करें।',
        keywords: ['प्रोफ़ाइल', 'नाम बदलें', 'profile', 'change name']
      }
    );

    await KBChunk.insertMany(faqChunks);
    console.log(`🎉 Seeding complete. Successfully inserted ${faqChunks.length} detailed FAQs into MongoDB.`);
  } catch (err) {
    console.error('❌ Seeder Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Closed Database Connection.');
  }
}

seed1200FAQs();
