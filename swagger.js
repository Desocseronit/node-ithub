const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'Products API',
  },
  host: 'localhost:3000',
  basePath: '/',
};

const outputFile = './swagger-output.json';
const routes = ['./src/index.js']; 

swaggerAutogen(outputFile, routes, doc);
