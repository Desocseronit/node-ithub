const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');

const config = require('./config'); 
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');;

const app = express();

app.use(logger);
app.use(express.json()); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});