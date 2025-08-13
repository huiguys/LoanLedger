require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data'); // <-- ADD THIS LINE
const { connectDb } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

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
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// --- API Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/data', dataRoutes); // <-- ADD THIS LINE

app.get('/', (req, res) => {
    res.send('LoanLedger Auth Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
