const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Request = require('../models/Request');

// Create new request (public)
router.post('/', async (req, res) => {
    const request = new Request({
        name: req.body.name,
        requestedRole: req.body.requestedRole,
        ipAddress: req.ip
    });
    try {
        const newRequest = await request.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all requests (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update request status (admin only)
router.patch('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;