require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../models/Account');

const userData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create user accounts
        const userAccounts = [
            { name: 'Administrator', code: 'samman', role: 'admin', isActive: true },
            { name: 'Family A', code: 'family123', role: 'family', isActive: true },
            { name: 'Viewer 001', code: 'viewer123', role: 'viewer', isActive: true }
        ];

        await Account.insertMany(userAccounts);

        console.log('User accounts created');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating data:', error);
        process.exit(1);
    }
};

userData();