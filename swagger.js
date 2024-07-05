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
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: [path.resolve(__dirname, './routes/*.js')],
    // apis: [
    //     path.resolve(__dirname, './routes/accessCodes.js'),
    //     path.resolve(__dirname, './routes/auth.js'),
    //     path.resolve(__dirname, './routes/expenses.js'),
    //     path.resolve(__dirname, './routes/requests.js'),
    // ],
};

module.exports = (app) => {
    app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)));
};
