const twilio = require('twilio');

const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // If Twilio isn't strictly configured in .env, mock the text softly in the console 
  // rather than crashing the production environment and stopping bill generation.
  if (!accountSid || !authToken || !fromNumber) {
    console.log(`\n[Twilio Service Mock] => SMS triggered to ${to}:\n"${body}"\n`);
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    // Normalize phone number (assuming India +91 if length is 10, otherwise pass raw)
    const phoneChars = to.replace(/\D/g, '');
    const finalPhone = phoneChars.length === 10 ? `+91${phoneChars}` : `+${phoneChars}`;
    
    await client.messages.create({
      body,
      from: fromNumber,
      to: finalPhone
    });
    console.log(`[Twilio Service] => Live SMS sent sequentially to ${finalPhone}`);
  } catch (error) {
    console.error('[Twilio Service Error] => Failed to transmit actual SMS:', error.message);
  }
};

module.exports = sendSMS;
