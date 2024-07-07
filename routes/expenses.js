const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Expense = require('../models/Expense');


/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expenses endpoints
 * 
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - amount
 *         - category
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         amount:
 *           type: number
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *         isPrivate:
 *           type: boolean
 *         visibleTo:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses visible to all roles
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, roleCheck(['admin', 'family', 'viewer']), async (req, res) => {
    try {
        const query = {
            isPrivate: false,
            visibleTo: { $in: req.user.role },
        };
        const expenses = await Expense.find(query);
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /expenses/admin:
 *   get:
 *     summary: Get all expenses (admin only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/admin', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense (admin only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
    const expense = new Expense({
        title: req.body.title,
        date: req.body.date,
        amount: req.body.amount,
        category: req.body.category,
        description: req.body.description,
        isPrivate: req.body.isPrivate,
        visibleTo: req.body.visibleTo,
    });
    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /expenses/{id}:
 *   patch:
 *     summary: Update an existing expense (admin only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense (admin only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to delete
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /expenses/{id}/comment:
 *   post:
 *     summary: Add a comment to an expense (family only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid data provided
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comment', auth, roleCheck(['family']), async (req, res) => {
    try {
        const { comment } = req.body;
        const { id } = req.params;
        const commentedBy = req.user.name;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Add the comment with commentedBy and commentedAt
        expense.comments.push({ comment, commentedBy, commentedAt: new Date() });

        await expense.save();

        res.json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /expenses/{id}/comment/{commentId}:
 *   patch:
 *     summary: Edit an expense comment (family only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense containing the comment
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Invalid data provided
 *       404:
 *         description: Expense or Comment not found, or unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:id/comment/:commentId', auth, roleCheck(['family']), async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment } = req.body;

        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Find the comment by commentId and ensure it was made by the current family member
        const familyComment = expense.comments.find(c => c._id.toString() === commentId && c.commentedBy === req.user.name);

        if (!familyComment) {
            return res.status(404).json({ message: 'Comment not found or you are not authorized to update this comment' });
        }

        // Update the comment text and updatedAt timestamp
        familyComment.comment = comment;
        familyComment.updatedAt = new Date();

        await expense.save();

        res.json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /expenses/{id}/comment/{commentId}:
 *   delete:
 *     summary: Delete an expense comment (family only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense containing the comment
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense or Comment not found, or unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id/comment/:commentId', auth, roleCheck(['family']), async (req, res) => {
    try {
        const { commentId } = req.params;

        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Find the comment by commentId and ensure it was made by the current family member
        const familyComment = expense.comments.find(c => c._id.toString() === commentId && c.commentedBy === req.user.name);

        if (!familyComment) {
            return res.status(404).json({ message: 'Comment not found or you are not authorized to delete this comment' });
        }

        // Soft delete the comment by setting deletedAt timestamp
        familyComment.deletedAt = new Date();

        await expense.save();

        res.json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;