// const { body, validationResult } = require('express-validator');

// const validateMobileNumber = () => {
//   return body('mobileNumber')
//     .matches(/^[6-9]\d{9}$/)
//     .withMessage('Please enter a valid 10-digit Indian mobile number');
// };

// const validatePassword = () => {
//   return body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');
// };

// const validateOTP = () => {
//   return body('otp')
//     .isLength({ min: 6, max: 6 })
//     .withMessage('OTP must be exactly 6 digits')
//     .isNumeric()
//     .withMessage('OTP must contain only numbers');
// };

// const handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       errors: errors.array().map(error => ({
//         field: error.path,
//         message: error.msg
//       }))
//     });
//   }
//   next();
// };

// const sanitizeMobileNumber = (mobileNumber) => {
//   // Remove any non-digit characters and ensure it starts with country code
//   const cleaned = mobileNumber.replace(/\D/g, '');
  
//   // If it's a 10-digit number, assume it's Indian and add +91
//   if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
//     return `+91${cleaned}`;
//   }
  
//   // If it already has country code
//   if (cleaned.length === 12 && cleaned.startsWith('91')) {
//     return `+${cleaned}`;
//   }
  
//   return cleaned;
// };

// module.exports = {
//   validateMobileNumber,
//   validatePassword,
//   validateOTP,
//   handleValidationErrors,
//   sanitizeMobileNumber
// };




/**
 * Validates an Indian phone number.
 * - Must be 10 digits.
 * - Must start with 6, 7, 8, or 9.
 * @param {string} phoneNumber The phone number to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
}

/**
 * Validates a password based on security requirements.
 * - At least 6 characters long.
 * - At least one uppercase letter.
 * - At least one lowercase letter.
 * - At least one number.
 * @param {string} password The password to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validatePassword(password) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return passwordRegex.test(password);
}

// --- THIS IS THE CRUCIAL FIX ---
// This line makes the functions available to be imported by other files.
module.exports = {
    validatePhoneNumber,
    validatePassword,
};