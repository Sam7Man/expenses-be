const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AccessCode = require('../models/AccessCode');

router.post('/login', [body('accessCode').notEmpty().withMessage('Access code is required')], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { accessCode } = req.body;
        const foundCode = await AccessCode.findOne({ code: accessCode, isActive: true });

        if (!foundCode) {
            return res.status(400).json({ message: 'Invalid access code' });
        }

        if (foundCode.validUntil && new Date() > foundCode.validUntil) {
            return res.status(400).json({ message: 'Access code has expired' });
        }

        // Update lastLogin and logIpAddress
        foundCode.lastLogin = new Date();
        foundCode.logIpAddress.push(req.ip);
        await foundCode.save();

        const payload = {
            user: {
                role: foundCode.role,
                name: foundCode.name
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;