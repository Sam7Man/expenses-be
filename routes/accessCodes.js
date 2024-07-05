const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const AccessCode = require('../models/AccessCode');


// Create new access code (admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
    const accessCode = new AccessCode({
        name: req.body.name,
        code: req.body.code,
        role: req.body.role,
        validUntil: req.body.validUntil,
        isActive: req.body.isActive
    });
    try {
        const newAccessCode = await accessCode.save();
        res.status(201).json(newAccessCode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all access codes (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accessCodes = await AccessCode.find();
        res.json(accessCodes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update access code (admin only)
router.patch('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const updatedAccessCode = await AccessCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAccessCode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete access code (admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        await AccessCode.findByIdAndDelete(req.params.id);
        res.json({ message: 'Access code deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;