const express = require('express');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
require('dotenv').config(); // <-- ADD THIS LINE to load the .env file
const db = require('../config/database');
const { sendOtp, verifyOtp } = require('../utils/otp');
const { validatePhoneNumber, validatePassword } = require('../utils/validation');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// 1. /register/send-otp
router.post('/register/send-otp', (req, res) => {
    console.log('Received request on /register/send-otp'); // <-- Logging
    const { phoneNumber } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
        console.log(`Validation failed for phoneNumber: ${phoneNumber}`); // <-- Logging
        return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    try {
        console.log(`Checking database for user: ${phoneNumber}`); // <-- Logging
        const user = db.prepare('SELECT * FROM users WHERE phone_number = ?').get(phoneNumber);
        if (user) {
            console.log(`User already exists: ${phoneNumber}`); // <-- Logging
            return res.status(409).json({ message: 'User already exists.' });
        }

        // If JWT_SECRET is not set, the app will fail.
        if (!JWT_SECRET) {
            console.error('FATAL: JWT_SECRET is not defined in your .env file.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        console.log(`Attempting to send OTP to: ${phoneNumber}`); // <-- Logging
        sendOtp(phoneNumber); // This function logs the OTP to the console
        res.status(200).json({ message: 'OTP sent successfully.' });

    } catch (err) {
        console.error('CRITICAL ERROR in /register/send-otp:', err); // <-- Enhanced error logging
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// (The rest of your auth.js routes remain the same)
// ...
// 2. /register/verify-otp
router.post('/register/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!verifyOtp(phoneNumber, otp)) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    res.status(200).json({ message: 'OTP verified successfully.' });
});

// 3. /register/complete
router.post('/register/complete', async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password does not meet requirements.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (phone_number, password) VALUES (?, ?)');
        const info = stmt.run(phoneNumber, hashedPassword);

        const token = jwt.sign({ id: info.lastInsertRowid }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error('Error in /register/complete:', err);
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'User already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// 4. /login
router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE phone_number = ?').get(phoneNumber);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});


module.exports = router;