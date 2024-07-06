require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const swaggerSetup = require('./swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');


// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors());
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS.split(', '),
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/account', require('./routes/accounts'));
app.use('/api/accounts', require('./routes/accounts'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

app.use('/api/request', require('./routes/requests'));
app.use('/api/requests', require('./routes/requests'));

app.use('/api/session', require('./routes/sessions'));
app.use('/api/sessions', require('./routes/sessions'));
swaggerSetup(app);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';
    res.status(status).json({
        error: {
            message,
            status,
        },
    });
});

// Export the app for testing (optional)
module.exports = app;

// Start the server (dev or production)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}