require('dotenv').config();

const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const Account = require('../models/Account');
const FailedLogin = require('../models/FailedLogin');

const MAX_LOGIN_ATTEMPTS = 4;
const BLOCK_TIME = 60 * 60 * 1000; // 60 minutes in ms

// # custom header
// module.exports = (req, res, next) => {
//     const token = req.header('x-auth-token');
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.user;
//         next();
//     } catch (err) {z
//         res.status(401).json({ message: 'Token is not valid' });
//     }
// };


// Bearer token header
module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded.user;

        // Fetch session from the database
        const session = await Session.findOne({ userId: user.id, token });

        if (!session || session.revoked || session.banned) {
            return res.status(401).json({ message: 'Session revoked or banned' });
        }

        // Fetch Account to check role and update lastIpAddress
        const account = await Account.findById(user.id);
        if (!account) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if account is revoked or banned
        if (account.isRevoked || account.isBanned) {
            return res.status(403).json({ message: 'Account is revoked or banned' });
        }

        // Check if the token has expired or is invalid for other reasons
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: 'Session expired' });
        }

        // Track failed login attempts by IP address
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const failedAttempts = await FailedLogin.findOne({ ipAddress: clientIp });

        if (failedAttempts && failedAttempts.attempts >= MAX_LOGIN_ATTEMPTS && Date.now() - failedAttempts.lastAttemptAt < BLOCK_TIME) {
            return res.status(429).json({ message: 'Too many failed login attempts. Try again later.' });
        }

        // If attempts are allowed or block time has passed, reset attempts
        if (!failedAttempts || Date.now() - failedAttempts.lastAttemptAt >= BLOCK_TIME) {
            await FailedLogin.findOneAndUpdate(
                { ipAddress: clientIp },
                { ipAddress: clientIp, attempts: 1, lastAttemptAt: Date.now() },
                { upsert: true }
            );
        } else {
            await FailedLogin.findOneAndUpdate(
                { ipAddress: clientIp },
                { $inc: { attempts: 1 }, lastAttemptAt: Date.now() }
            );
        }

        // Update lastIpAddress in Account
        account.lastIpAddress = clientIp;
        await account.save();

        req.session = session;
        req.user = user;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};