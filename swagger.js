const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Products API',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/',
};

const outputFile = './swagger-output.json';
const routes = ['./src/index.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log('Swagger JSON успешно сгенерирован!');
});
