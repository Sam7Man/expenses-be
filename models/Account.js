const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String, required: true, unique: true },
    role: { type: String, enum: ['viewer', 'family', 'admin'], required: true },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    lastLogout: { type: Date },
    lastIpAddress: { type: String },
    logIpAddress: { type: [String] },
    isRevoked: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

AccountSchema.pre('save', function(next) {
    // Ensure logIpAddress stores only unique IP addresses
    if (this.isModified('lastIpAddress') && this.lastIpAddress && !this.logIpAddress.includes(this.lastIpAddress)) {
        this.logIpAddress.push(this.lastIpAddress);
    }
    next();
});

module.exports = mongoose.model('Account', AccountSchema);