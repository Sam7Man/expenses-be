const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Account = require('../models/Account');
const Session = require('../models/Session');

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account endpoints
 * 
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         role:
 *           type: string
 *         validUntil:
 *           type: string
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         lastLogout:
 *           type: string
 *           format: date-time
 *         lastIpAddress:
 *           type: string
 *         logIpAddress:
 *           type: string
 *           format: array
 *         isRevoked:
 *           type: boolean
 *         isBanned:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time          
 */

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Create a new account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
    const account = new Account({
        name: req.body.name,
        code: req.body.code,
        role: req.body.role,
        validUntil: req.body.validUntil,
        isActive: req.body.isActive,
    });
    try {
        const newAccount =  await account.save();
        res.status(201).json(newAccount);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accounts = await Account.find();
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /account/{id}:
 *   patch:
 *     summary: Update an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const updatedAccount =  await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAccount);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /account/{id}:
 *   delete:
 *     summary: Delete an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        await Account.findByIdAndDelete(req.params.id);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /accounts/revoked:
 *   get:
 *     summary: Get all revoked accounts (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved revoked accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/revoked', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const revokedAccounts = await Account.find({ isRevoked: true });
        res.json(revokedAccounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /account/revoke/{id}:
 *   put:
 *     summary: Revoke an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to revoke
 *     responses:
 *       200:
 *         description: Account revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put('/revoke/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Set account status to revoked
        account.isRevoked = true;
        account.isActive = false;
        await account.save();

        res.json({ message: 'Account revoked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /account/unrevoke/{id}:
 *   put:
 *     summary: Unrevoke an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to unrevoke
 *     responses:
 *       200:
 *         description: Account unrevoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put('/unrevoke/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Remove revoke status from account
        account.isRevoked = false;
        if (!account.isBanned) {
            return account.isActive = true;
        }
        await account.save();

        res.json({ message: 'Account unrevoked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /accounts/banned:
 *   get:
 *     summary: Get all banned accounts (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved banned accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/banned', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const bannedAccounts = await Account.find({ isBanned: true });
        res.json(bannedAccounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /account/ban/{id}:
 *   put:
 *     summary: Ban an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to ban
 *     responses:
 *       200:
 *         description: Account banned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put('/ban/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Set account status to banned
        account.isBanned = true;
        account.isRevoked = true;
        account.isActive = false;
        await account.save();

        // Also revoke all sessions associated with this account
        await Session.updateMany({ userId: accountId }, { banned: true });

        res.json({ message: 'Account banned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /account/unban/{id}:
 *   put:
 *     summary: Unban an account (admin only)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to unban
 *     responses:
 *       200:
 *         description: Account unbanned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put('/unban/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Set account status to banned
        account.isBanned = false;
        account.isRevoked = false;
        account.isActive = true;
        await account.save();

        // Also unrevoke all sessions associated with this account
        await Session.updateMany({ userId: accountId }, { banned: false });

        res.json({ message: 'Account banned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;