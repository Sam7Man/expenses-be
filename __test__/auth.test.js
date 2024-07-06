const request = require('supertest');
const app = require('../server');
const AccessCode = require('../models/AccessCode');

describe('Auth Endpoints', () => {
    beforeEach(async () => {
        await AccessCode.deleteMany({});
    });

    it('should login with valid access code', async () => {
        const accessCode = new AccessCode({
            code: 'testcode',
            role: 'viewer',
            isActive: true,
        });
        await accessCode.save();

        const res = await request(app)
            .post('/api/auth/login')
            .send({ accessCode: 'testcode' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid access code', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ accessCode: 'invalidcode' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Invalid access code');
    });
});