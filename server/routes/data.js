const express = require('express');
const { dbClient: db } = require('../config/database');
// CORRECTED: Destructure authenticateToken from the module exports
const { authenticateToken } = require('../middleware/auth'); 

const router = express.Router();

// Middleware to ensure user is authenticated for all data routes
router.use(authenticateToken);

// GET all data for the logged-in user
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const persons = await db.query('SELECT * FROM persons WHERE user_id = $1', [userId]);
        const loans = await db.query('SELECT * FROM loans WHERE user_id = $1', [userId]);
        const payments = await db.query('SELECT * FROM payments WHERE user_id = $1', [userId]);

        res.json({
            persons: persons.rows,
            loans: loans.rows,
            payments: payments.rows,
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST a new person
router.post('/persons', async (req, res) => {
    const userId = req.user.id;
    const { name, phoneNumber } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO persons (user_id, name, phone_number) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, phoneNumber]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding person:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST a new loan
router.post('/loans', async (req, res) => {
    const userId = req.user.id;
    const { personId, type, amount, interestRate, interestType, paymentSchedule, startDate, status } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO loans (user_id, person_id, type, amount, interest_rate, interest_type, payment_schedule, start_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [userId, personId, type, amount, interestRate, interestType, paymentSchedule, startDate, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding loan:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST a new payment
router.post('/payments', async (req, res) => {
    const userId = req.user.id;
    const { loanId, amount, date, type, method, notes } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO payments (user_id, loan_id, amount, date, type, method, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, loanId, amount, date, type, method, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding payment:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
