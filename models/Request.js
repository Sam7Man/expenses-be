const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    requestedRole: { type: String, enum: ['viewer', 'family'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', RequestSchema);