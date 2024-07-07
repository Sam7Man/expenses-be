require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const swaggerSetup = require('./swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/Auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP requests per windowMs (15min)
});
app.use(limiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(', ') : [];
const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

// Connect to database
connectDB();

// Trust proxy setting
// app.set('trust proxy', true);
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Setup Swagger
swaggerSetup(app);

// Routes
app.use('/api/account', authMiddleware, require('./routes/accounts'));
app.use('/api/accounts', authMiddleware, require('./routes/accounts'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', authMiddleware, require('./routes/expenses'));

app.use('/api/request', authMiddleware, require('./routes/requests'));
app.use('/api/requests', authMiddleware, require('./routes/requests'));

app.use('/api/session', authMiddleware, require('./routes/sessions'));
app.use('/api/sessions', authMiddleware, require('./routes/sessions'));

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