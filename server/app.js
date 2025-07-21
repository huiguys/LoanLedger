// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const authRoutes = require('./routes/auth');
// const database = require('./config/database');

// const app = express();
// const PORT = process.env.PORT || 3001;

// // --- CORS Configuration ---
// // This is the crucial fix. We are telling the server to only accept
// // requests that come from your frontend application's address.
// const corsOptions = {
//   origin: 'http://localhost:5173', // Your frontend's origin
//   optionsSuccessStatus: 200 // For legacy browser support
// };

// app.use(cors(corsOptions)); // Use the specific options

// // --- Other Middlewares ---
// app.use(helmet());
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 20,
//     message: 'Too many requests from this IP, please try again after 15 minutes',
// });

// // --- Routes ---
// app.use('/api/auth', authLimiter, authRoutes);

// app.get('/', (req, res) => {
//     res.send('LoanLedger Auth Server is running!');
// });

// // --- Start Server ---
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });






const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// require('dotenv').config(); // This line was removed
const authRoutes = require('./routes/auth');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS Configuration ---
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend's origin
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// --- Other Middlewares ---
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