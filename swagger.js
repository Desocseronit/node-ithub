const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'Node.js Final Project API',
    description: 'REST API с JWT-аутентификацией, RBAC, PostgreSQL, Redis и Docker Compose',
    version: '1.0.0',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
    {
      url: 'https://node-ithub.onrender.com/',
      description: 'Production (Render)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        id: 1,
        email: 'user@example.com',
        name: 'Ivan Ivanov',
        role: 'USER',
        createdAt: '2026-11-26T10:00:00.000Z',
      },
      Post: {
        id: 1,
        title: 'Заголовок поста',
        content: 'Подробное содержание поста',
        published: true,
        authorId: 1,
        createdAt: '2026-11-26T10:00:00.000Z',
      },
      Tag: {
        id: 1,
        name: 'nodejs',
      },
      Product: {
        id: 1,
        name: 'Ноутбук',
        price: 75000,
        description: 'Рабочий ноутбук',
      },
      RegisterInput: {
        $email: 'newuser@example.com',
        $password: 'StrongPass123!',
        $name: 'Alex',
      },
      LoginInput: {
        $email: 'newuser@example.com',
        $password: 'StrongPass123!',
      },
      CreatePostInput: {
        $title: 'Новый пост',
        content: 'Текст поста',
        published: false,
        tags: ['news', 'backend'],
      },
      ErrorResponse: {
        error: 'Описание ошибки',
      },
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen(outputFile, routes, doc);
