const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbClient: db } = require('../config/database'); // Correctly import the database client
const { sendOtp, verifyOtp } = require('../utils/otp');
const { validatePhoneNumber, validatePassword } = require('../utils/validation');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// 1. /register/send-otp
router.post('/register/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }
    
    if (!JWT_SECRET) {
        console.error('FATAL: JWT_SECRET is not defined.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    try {
        // Use parameterized query for security
        const userResult = await db.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
        if (userResult.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this phone number already exists.' });
        }
        
        sendOtp(phoneNumber); // This function still logs to console for debugging
        res.status(200).json({ success: true, message: 'OTP sent successfully.' });

    } catch (err) {
        console.error('ERROR in /register/send-otp:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});

// 2. /register/verify-otp
router.post('/register/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!verifyOtp(phoneNumber, otp)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
});

// 3. /register/complete
router.post('/register/complete', async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!validatePassword(password)) {
        return res.status(400).json({ success: false, message: 'Password does not meet requirements.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Use RETURNING id to get the new user's ID
        const result = await db.query(
            'INSERT INTO users (phone_number, password) VALUES ($1, $2) RETURNING id',
            [phoneNumber, hashedPassword]
        );
        const newUser = result.rows[0];

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ success: true, token });
    } catch (err) {
        console.error('Error in /register/complete:', err);
        if (err.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ success: false, message: 'User already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 4. /login
router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
        const user = result.rows[0];
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, token });
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;