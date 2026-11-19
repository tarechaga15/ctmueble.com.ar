/**
 * Handler serverless para AWS Lambda / API Gateway.
 * Envuelve la aplicación Express para que funcione en entornos serverless.
 *
 * Uso: El handler exportado es invocado por Lambda en cada request.
 */
const serverless = require('serverless-http');
const app = require('./app');

// Envuelve la app Express para el formato de eventos Lambda
const handler = serverless(app, {
    binary: ['application/pdf', 'image/*'],
});

module.exports = { handler };
