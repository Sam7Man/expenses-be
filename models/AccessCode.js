const mongoose = require('mongoose');

const AccessCodeSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String, required: true, unique: true },
    role: { type: String, enum: ['viewer', 'family', 'admin'], required: true },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    logIpAddress: { type: [String] },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('AccessCode', AccessCodeSchema);
