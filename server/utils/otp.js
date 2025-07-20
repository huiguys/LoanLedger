const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const getOTPExpiry = (minutes = 5) => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
};

const sendOTP = async (mobileNumber, otp) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  console.log(`Sending OTP ${otp} to ${mobileNumber}`);
  
  // Simulate SMS sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For development, always return success
  // In production, handle SMS service responses
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    message: 'OTP sent successfully'
  };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  sendOTP
};