require('dotenv').config();
const mongoose = require('mongoose');
const AccessCode = require('../models/AccessCode');

const userData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create admin access code
        await AccessCode.create({
            name: 'samman',
            code: 'admin123',
            role: 'admin',
            isActive: true,
        });

        console.log('Admin access code created');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating data:', error);
        process.exit(1);
    }
};

userData();