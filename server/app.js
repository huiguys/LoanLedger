const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const { connectDb } = require('./config/database'); // Import the connect function

const app = express();
const PORT = process.env.PORT || 3001;

// --- Connect to the database first ---
connectDb();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);

app.get('/', (req, res) => {
    res.send('LoanLedger Auth Server is running!');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});