const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    token: { type: String, required: true },
    revoked: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
});

module.exports = mongoose.model('Session', SessionSchema);