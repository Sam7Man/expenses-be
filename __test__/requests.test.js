const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Request = require('../models/Request');

describe('Requests Endpoints', () => {
    let adminToken;
    let nonAdminToken;

    beforeEach(async () => {
        await Account.deleteMany({});
        await Request.deleteMany({});

        // Create admin access code and generate token
        const adminAccount =  new Account({
            code: 'admincode',
            role: 'admin',
            isActive: true,
        });
        await adminAccount.save();
        adminToken = jwt.sign({ user: { role: 'admin' } }, process.env.JWT_SECRET);

        // Create non-admin access code and generate token
        const nonAdminAccount =  new Account({
            code: 'nonadmincode',
            role: 'viewer',
            isActive: true,
        });
        await nonAdminAccount.save();
        nonAdminToken = jwt.sign({ user: { role: 'viewer' } }, process.env.JWT_SECRET);
    });

    describe('POST /api/requests/', () => {
        it('should create a new request', async () => {
            const res = await request(app)
                .post('/api/requests/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Request',
                    requestedRole: 'viewer',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
        });

        it('should not create a new request with invalid data', async () => {
            const res = await request(app)
                .post('/api/requests/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    requestedRole: 'invalidRole',
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/requests/', () => {
        it('should get all requests as admin', async () => {
            const newRequest = new Request({
                name: 'Test Request',
                requestedRole: 'viewer',
                ipAddress: '127.0.0.1',
            });
            await newRequest.save();

            const res = await request(app)
                .get('/api/requests/')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toEqual(1);
        });

        it('should not get all requests without admin role', async () => {
            const res = await request(app)
                .get('/api/requests/')
                .set('Authorization', `Bearer ${nonAdminToken}`);

            expect(res.statusCode).toEqual(401); // or 403 depending on your implementation
        });
    });

    describe('PATCH /api/requests/:id', () => {
        it('should update request status', async () => {
            const newRequest = new Request({
                name: 'Test Request',
                requestedRole: 'viewer',
                status: 'pending',
                ipAddress: '127.0.0.1',
            });
            await newRequest.save();

            const res = await request(app)
                .patch(`/api/requests/${newRequest._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'approved',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('approved');
        });

        it('should not update request status with invalid data', async () => {
            const newRequest = new Request({
                name: 'Test Request',
                requestedRole: 'viewer',
                status: 'pending',
                ipAddress: '127.0.0.1',
            });
            await newRequest.save();

            const res = await request(app)
                .patch(`/api/requests/${newRequest._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'invalidStatus',
                });

            expect(res.statusCode).toEqual(400);
        });
    });
});