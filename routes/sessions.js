const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Session = require('../models/Session');
const Account = require('../models/Account');
const mongoose = require('mongoose');

/**
 * @swagger
 * tags:
 *   name: Session
 *   description: Session endpoints
 * 
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - userId
 *         - token
 *       properties:
 *         userId:
 *           type: string
 *         token:
 *           type: string
 *         revoked:
 *           type: boolean
 *         banned:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         revokedAt:
 *           type: string
 *           format: date-time          
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get all active sessions (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const activeSessions = await Session.find({ revoked: false });
        res.json(activeSessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /sessions/revoked:
 *   get:
 *     summary: Get all revoked sessions (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved revoked sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/revoked', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const revokedSessions = await Session.find({ revoked: true });
        res.json(revokedSessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


/**
 * @swagger
 * /session/revoke/{id}:
 *   put:
 *     summary: Revoke a session (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to revoke
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.put('/revoke/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.revoked = true;
        session.revokedAt = new Date();
        await session.save();

        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/ban/{id}:
 *   put:
 *     summary: Ban sessions of a user (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to ban
 *     responses:
 *       200:
 *         description: Session banned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.put('/ban/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.banned = true;
        await session.save();

        res.json({ message: 'Session banned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/delete/{id}:
 *   delete:
 *     summary: Delete a session (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to delete
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await session.remove();

        res.json({ message: 'Session deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/revokes/{userId}:
 *   put:
 *     summary: Revoke all sessions of a user (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose sessions to revoke
 *     responses:
 *       200:
 *         description: Sessions revoked successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/revokes/:userId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.updateMany({ userId }, { $set: { revoked: true, revokedAt: new Date() } });

        res.json({ message: 'Sessions revoked successfully', sessions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/bans/{userId}:
 *   put:
 *     summary: Ban all sessions of a user (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose sessions to ban
 *     responses:
 *       200:
 *         description: Sessions banned successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/bans/:userId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.updateMany({ userId }, { $set: { banned: true } });

        res.json({ message: 'Sessions banned successfully', sessions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/deletes/{userId}:
 *   delete:
 *     summary: Delete all sessions of a user (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose sessions to delete
 *     responses:
 *       200:
 *         description: Sessions deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/deletes/:userId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Session.deleteMany({ userId });

        res.json({ message: 'Sessions deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;