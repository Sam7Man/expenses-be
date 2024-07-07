const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Session = require('../models/Session');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 * 
 * components:
 *   schemas:
 *     Auth:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auth'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auth'
 *       400:
 *         description: Invalid access code
 *       500:
 *         description: Server error
 */
router.post('/login', [body('code').notEmpty().withMessage('Account code is required')], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { code } = req.body;
        const foundCode = await Account.findOne({ code: code, isActive: true });

        if (!foundCode) {
            return res.status(400).json({ message: 'Invalid access code' });
        }

        if (foundCode.isRevoked || foundCode.isBanned) {
            return res.status(403).json({ message: 'Account is revoked or banned' });
        }

        if (foundCode.validUntil && new Date() > foundCode.validUntil) {
            return res.status(400).json({ message: 'Account code has expired' });
        }

        // Update lastLogin and logIpAddress
        foundCode.lastLogin = new Date();
        foundCode.logIpAddress.push(req.ip);
        await foundCode.save();

        const payload = {
            user: {
                id: foundCode._id,
                role: foundCode.role,
                name: foundCode.name
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, async (err, token) => {
            if (err) throw err;

            // Save session details in Session model
            const session = new Session({
                userId: foundCode._id,
                token: token,
            });
            await session.save();

            res.status(200).json({ token });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout', async (req, res) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const session = await Session.findOne({ userId: decoded.user.id, token });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Mark the session as revoked so that the session cannot be used for login again
        session.revoked = true;
        session.revokedAt = new Date();
        await session.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;