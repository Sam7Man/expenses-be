const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    comments: [{ type: String }],
    isPrivate: { type: Boolean, default: false },
    visibleTo: [{ type: String, enum: ['admin', 'family', 'viewer'] }],
});

module.exports = mongoose.model('Expense', ExpenseSchema);