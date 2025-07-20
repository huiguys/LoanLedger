const crypto = require('crypto');

// A simple in-memory store for OTPs. In a real production app,
// you would use a database like Redis for this.
const otpStore = new Map();

/**
 * Generates and "sends" a 6-digit OTP for a given phone number.
 * In this development version, it just logs it to the console.
 * @param {string} phoneNumber The phone number to send the OTP to.
 * @returns {string} The generated OTP.
 */
function sendOtp(phoneNumber) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 5 * 60 * 1000; // OTP is valid for 5 minutes

    otpStore.set(phoneNumber, { otp, expires });

    console.log(`Sending OTP ${otp} to +91${phoneNumber}`); // Simulate sending SMS
    return otp;
}

/**
 * Verifies if the provided OTP is correct and not expired.
 * @param {string} phoneNumber The user's phone number.
 * @param {string} otp The OTP provided by the user.
 * @returns {boolean} True if the OTP is valid, false otherwise.
 */
function verifyOtp(phoneNumber, otp) {
    const storedOtp = otpStore.get(phoneNumber);

    if (!storedOtp) {
        return false; // No OTP was ever sent to this number
    }

    // Check if OTP matches and is not expired
    const isValid = storedOtp.otp === otp && Date.now() < storedOtp.expires;

    if (isValid) {
        otpStore.delete(phoneNumber); // OTP is single-use, delete it after verification
    }

    return isValid;
}

// --- THIS IS THE CRUCIAL FIX ---
// Makes the `sendOtp` and `verifyOtp` functions available to other files.
module.exports = {
    sendOtp,
    verifyOtp,
};