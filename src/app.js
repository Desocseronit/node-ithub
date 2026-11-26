const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Безопасность: helmet (включает X-Frame-Options и X-Content-Type-Options)
app.use(helmet());

// Ограничение размера тела запроса до 10kb
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(logger);
}

// Swagger (безопасное подключение, чтобы тесты не падали, если json ещё не сгенерирован)
try {
  const swaggerDocument = require('../swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {

}

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
