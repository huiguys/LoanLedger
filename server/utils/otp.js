const crypto = require('crypto');
const { dbClient: db } = require('../config/database');

/**
 * Generates a 6-digit OTP, stores it in the database, and logs it for development.
 * @param {string} phoneNumber The phone number to associate with the OTP.
 * @returns {Promise<string>} The generated OTP.
 */
async function sendOtp(phoneNumber) {
    const otp = crypto.randomInt(100000, 999999).toString();
    // OTP is valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    try {
        // Delete any old OTPs for this number to ensure only the latest is valid
        await db.query('DELETE FROM otps WHERE mobile_number = $1', [phoneNumber]);

        // Insert the new OTP into the database
        await db.query(
            'INSERT INTO otps (mobile_number, otp, expires_at) VALUES ($1, $2, $3)',
            [phoneNumber, otp, expiresAt]
        );

        console.log(`Sending OTP ${otp} to ${phoneNumber}`); // Simulate sending SMS
        return otp;
    } catch (error) {
        console.error("Error saving OTP to database:", error);
        throw new Error("Could not process OTP request.");
    }
}

/**
 * Verifies if the provided OTP is correct, not expired, and exists in the database.
 * @param {string} phoneNumber The user's phone number.
 * @param {string} otp The OTP provided by the user.
 * @returns {Promise<boolean>} True if the OTP is valid, false otherwise.
 */
async function verifyOtp(phoneNumber, otp) {
    try {
        const result = await db.query(
            'SELECT * FROM otps WHERE mobile_number = $1 AND otp = $2',
            [phoneNumber, otp]
        );

        const storedOtp = result.rows[0];

        if (!storedOtp) {
            console.log(`Verification failed: No OTP found for ${phoneNumber}`);
            return false; // OTP not found or does not match
        }

        // Check if OTP is expired
        if (new Date() > new Date(storedOtp.expires_at)) {
            console.log(`Verification failed: OTP for ${phoneNumber} has expired.`);
            // Clean up expired OTP
            await db.query('DELETE FROM otps WHERE id = $1', [storedOtp.id]);
            return false;
        }

        // OTP is valid, clean it up so it can't be reused
        await db.query('DELETE FROM otps WHERE id = $1', [storedOtp.id]);
        
        console.log(`Successfully verified OTP for ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error("Error verifying OTP from database:", error);
        return false;
    }
}

module.exports = {
    sendOtp,
    verifyOtp,
};
