const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Personal Expenses API',
            version: '1.0.0',
            description: 'API for managing personal expenses',
        },
        servers: [
            {
                url: '/', // Change the URL to match Vercel's deployment
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

module.exports = (app) => {
    const specs = swaggerJsdoc(options);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
};
