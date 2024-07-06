const mongoose = require('mongoose');

const FailedLoginSchema = new mongoose.Schema({
    ipAddress: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FailedLogin', FailedLoginSchema);