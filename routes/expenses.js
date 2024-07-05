const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Expense = require('../models/Expense');


// Get all expenses (admin and family)
router.get('/', auth, roleCheck(['admin', 'family']), async (req, res) => {
    try {
        const expenses = await Expense.find({ isPrivate: false });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all expenses (admin only)
router.get('/all', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new expense (admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
    const expense = new Expense({
        title: req.body.title,
        date: req.body.date,
        amount: req.body.amount,
        category: req.body.category,
        description: req.body.description,
        isPrivate: req.body.isPrivate,
        visibleTo: req.body.visibleTo
    });
    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update expense (admin only)
router.patch('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete expense (admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add comment to expense (family only)
router.post('/:id/comment', auth, roleCheck(['family']), async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        expense.comments.push(req.body.comment);
        await expense.save();
        res.json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;