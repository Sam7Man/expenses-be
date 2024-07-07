const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    commentedBy: { type: String },
    commentedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
});

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    comments: [CommentSchema],
    isPrivate: { type: Boolean, default: false },
    visibleTo: [{ type: String, enum: ['admin', 'family', 'viewer'] }],
});

module.exports = mongoose.model('Expense', ExpenseSchema);