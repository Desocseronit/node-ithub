process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

beforeAll(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Auth, Security & RBAC Integration Tests', () => {
  const user1 = { email: 'user1@example.com', password: 'Password123!', name: 'User One' };
  const user2 = { email: 'user2@example.com', password: 'Password123!', name: 'User Two' };
  let user1Token;
  let user2Token;
  let createdPostId;

  // Тест 1: Регистрация — успех
  test('1. POST /auth/register - should register a new user successfully', async () => {
    const res = await request(app).post('/auth/register').send(user1);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(user1.email);
    expect(res.body.password).toBeUndefined();
  });

  // Тест 2: Регистрация — дублирующийся email
  test('2. POST /auth/register - should fail on duplicate email', async () => {
    const res = await request(app).post('/auth/register').send(user1);
    expect(res.statusCode).toBe(409);
  });

  // Тест 3: Логин — успех + заголовки Helmet и httpOnly cookie
  test('3. POST /auth/login - should login and return access token + set httpOnly cookie + security headers', async () => {
    const res = await request(app).post('/auth/login').send({
      email: user1.email,
      password: user1.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=.*HttpOnly/i);
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');

    user1Token = res.body.accessToken;
  });

  // Тест 4: Логин — неверный пароль
  test('4. POST /auth/login - should fail with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: user1.email,
      password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(401);
  });

  // Тест 5: Защищённый маршрут — без токена
  test('5. GET /auth/me - should return 401 without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
  });

  // Тест 6: Защищённый маршрут — с токеном
  test('6. GET /auth/me - should return current user with valid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(user1.email);
  });

  // Тест 7: RBAC — другой пользователь получает 403 при попытке удалить чужой пост
  test('7. DELETE /api/posts/:id - another user gets 403 when deleting someone else post', async () => {
    // Создаём пост от user1
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'User1 Post', content: 'Content' });
    expect(postRes.statusCode).toBe(201);
    createdPostId = postRes.body.id;

    // Регистрируем и логиним user2
    await request(app).post('/auth/register').send(user2);
    const login2 = await request(app).post('/auth/login').send({
      email: user2.email,
      password: user2.password,
    });
    user2Token = login2.body.accessToken;

    // user2 пытается удалить пост user1
    const delRes = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(delRes.statusCode).toBe(403);
  });

  // Тест 8: RBAC — владелец успешно удаляет свой пост
  test('8. DELETE /api/posts/:id - owner can delete their own post', async () => {
    const delRes = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(delRes.statusCode).toBe(204);
  });
});
