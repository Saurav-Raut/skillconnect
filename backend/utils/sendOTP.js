const sendOTP = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromPhone) {
    try {
      const client = require('twilio')(accountSid, authToken);
      await client.messages.create({
        body: `SkillConnect verification code: ${otp}. Valid for 5 minutes.`,
        from: fromPhone,
        to: phone
      });
      console.log(`OTP ${otp} sent successfully to ${phone} via Twilio.`);
      return true;
    } catch (error) {
      console.error('Twilio Error:', error.message);
      // Fallback
    }
  }

  // Fallback / Development mode
  console.log('--- DEVELOPMENT OTP SERVICE ---');
  console.log(`Phone: ${phone}`);
  console.log(`Verification OTP Code: ${otp}`);
  console.log('--------------------------------');
  return true;
};

module.exports = sendOTP;
