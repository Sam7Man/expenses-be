const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const roleCheck = require('../middleware/roleCheck');
const Session = require('../models/Session');

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
 * /session/{sessionId}:
 *   get:
 *     summary: Get session details
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get('/:sessionId', auth, async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
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
router.get('//revoked', auth, roleCheck(['admin']), async (req, res) => {
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
 * /session/revoke/{userId}/{sessionId}:
 *   put:
 *     summary: Revoke a user session (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose session is to be revoked
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to be revoked
 *     responses:
 *       200:
 *         description: User session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found for the user
 *       500:
 *         description: Server error
 */
router.put('/revoke/:userId/:sessionId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        // Check if the session belongs to the specified user
        const session = await Session.findOne({ userId, _id: sessionId });

        if (!session) {
            return res.status(404).json({ message: 'Session not found for the user' });
        }

        // Mark session as revoked
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
 * /session/revoke/{sessionId}:
 *   put:
 *     summary: Revoke a session (admin only)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
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
router.put('/revoke/:sessionId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Mark session as revoked
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
 * /session/ban/:userId:
 *   put:
 *     summary: Ban sessions of a user (admin only)
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
 *         description: Session banned successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/ban/:userId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const userId = req.params.userId;

        // Ban all sessions associated with the user
        await Session.updateMany({ userId }, { banned: true });

        res.json({ message: 'Sessions banned successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /session/:userId:
 *   delete:
 *     summary: Delete sessions of a user (admin only)
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
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:userId', auth, roleCheck(['admin']), async (req, res) => {
    try {
        const userId = req.params.userId;

        // Delete all sessions associated with the user
        await Session.deleteMany({ userId });

        res.json({ message: 'Sessions deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;