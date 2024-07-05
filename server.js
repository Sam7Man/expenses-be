require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const swaggerSetup = require('./swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/access-codes', require('./routes/accessCodes'));
app.use('/api/requests', require('./routes/requests'));
swaggerSetup(app);

// Global error handler
app.use((err, req, res, next) => {
    // console.error(err.stack);
    // res.status(500).send('Something broke!');
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});