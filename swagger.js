const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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

module.exports = (app) => {
    const specs = swaggerJsdoc(options);
    
    // Serve Swagger JSON
    app.get('/api/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    // Serve Swagger UI
    app.use('/api/docs', swaggerUi.serve);
    app.get('/api/docs', swaggerUi.setup(null, { swaggerOptions: { url: '/api/swagger.json' } }));
};