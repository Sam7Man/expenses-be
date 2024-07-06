const request = require('supertest');
const app = require('../server');
const Account = require('../models/Account');

describe('Auth Endpoints', () => {
    beforeEach(async () => {
        await Account.deleteMany({});
    });

    it('should login with valid access code', async () => {
        const account = new Account({
            code: 'testcode',
            role: 'viewer',
            isActive: true,
        });
        await account.save();
z
        const res = await request(app)
            .post('/api/auth/login')
            .send({ account: 'testcode' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid access code', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ account: 'invalidcode' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Invalid access code');
    });
});