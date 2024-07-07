const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const express = require('express');

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Personal Expenses API',
            version: '1.0.0',
            description: 'API for managing personal expenses',
        },
        servers: [
            {
                url: '/api',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: [path.resolve(__dirname, './routes/*.js')],
};

const setupSwagger = (app) => {
    // Initialize Swagger-jsdoc
    const specs = swaggerJsdoc(options);

    // Serve Swagger JSON
    app.get('/api/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    // Serve Swagger UI using locally hosted assets
    const swaggerUiAssetsPath = path.join(__dirname, './public/swagger');
    app.use('/api/docs', swaggerUi.serve);
    app.get('/api/docs', swaggerUi.setup(null, {
        explorer: true,
        swaggerOptions: {
            url: '/api/swagger.json',
            validatorUrl: null,
            persistAuthorization: true,
            requestInterceptor: (req) => {
                const token = localStorage.getItem('swagger-auth-token');
                if (token) {
                    req.headers.Authorization = `Bearer ${token}`;
                }
                return req;
            },
            onComplete: () => {
                const authBtn = document.querySelector('.authorize__btn');
                authBtn.addEventListener('click', () => {
                    const authForm = document.querySelector('.auth-container');
                    const submitBtn = authForm.querySelector('.modal-ux-footer .btn-done');
                    submitBtn.addEventListener('click', () => {
                        const tokenInput = authForm.querySelector('input[type="text"]');
                        localStorage.setItem('swagger-auth-token', tokenInput.value);
                    });
                });
            }
        },
    }));

    // Serve Swagger UI statically
    app.use('/api/docs', express.static(swaggerUiAssetsPath));

    // or serve index.html with Swagger UI directly
    // app.get('/api/docs', express.static(path.join(swaggerUiAssetsPath, 'index.html')));
};

module.exports = setupSwagger;