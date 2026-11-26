# Node.js Final Project API

REST API для управления постами, пользователями и товарами с JWT-аутентификацией, ролевой моделью доступа (RBAC), кэшированием в Redis, документацией Swagger и контейнеризацией в Docker Compose.

## Стек технологий
- **Backend:** Node.js, Express 5
- **База данных и ORM:** PostgreSQL 16, Prisma 7
- **Кэширование:** Redis 7 (`ioredis`)
- **Аутентификация и безопасность:** JWT (`access` + `refresh` в `httpOnly` cookie), `bcrypt`, `helmet`, `express-rate-limit`, Joi-валидация
- **Документация:** Swagger UI (`/api/docs`)
- **Тестирование:** Jest, Supertest
- **Инфраструктура:** Docker, Docker Compose

## Публичный деплой
- **API URL:** `https://onrender.com`
- **Swagger UI:** `https://onrender.com/api/docs`

---

## Инструкция по запуску

### 1. Запуск через Docker Compose
1. Скопируйте файл переменных окружения:
   ```bash
   cp .env.example .env
   ```
2. Поднимите контейнеры (`app`, `db`, `redis`):
   ```bash
   docker-compose up --build
   ```
   При старте автоматически применятся миграции Prisma (`npx prisma migrate deploy`), и API станет доступно на `http://localhost:3000`.
   Документация Swagger: `http://localhost:3000/api/docs`.

### 2. Локальный запуск (без Docker)
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Настройте `.env` (укажите `DATABASE_URL` для PostgreSQL, `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET`).
3. Сгенерируйте клиент Prisma, примените миграции и документацию:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run swagger
   ```
4. Запустите сервер:
   ```bash
   npm start
   ```
5. Запуск автотестов:
   ```bash
   npm test
   ```

---

## Список эндпоинтов

### Аутентификация (`/auth`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| `POST` | `/auth/register` | Публичный | Регистрация нового пользователя |
| `POST` | `/auth/login` | Публичный | Вход в систему (возвращает `accessToken` и ставит `refreshToken` в `httpOnly` cookie) |
| `POST` | `/auth/refresh` | Cookie | Обновление пары токенов |
| `POST` | `/auth/logout` | Cookie | Выход из системы (очистка cookie) |
| `GET` | `/auth/me` | Авторизованный | Получение данных текущего пользователя |

### Посты (`/api/posts`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| `GET` | `/api/posts` | Публичный | Список постов с фильтрацией (`search`, `published`, `authorId`), сортировкой, пагинацией и кэшированием в Redis |
| `GET` | `/api/posts/:id` | Публичный | Получение поста по ID с автором и тегами |
| `POST` | `/api/posts` | `USER`, `MODERATOR`, `ADMIN` | Создание нового поста |
| `PATCH` | `/api/posts/:id` | Владелец / `MODERATOR` / `ADMIN` | Редактирование поста |
| `DELETE` | `/api/posts/:id` | Владелец / `MODERATOR` / `ADMIN` | Удаление поста |

### Товары (`/api/products`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| `GET` | `/api/products` | Публичный | Список товаров с фильтрацией и пагинацией |
| `GET` | `/api/products/:id` | Публичный | Получение товара по ID |
| `POST` | `/api/products` | Публичный | Создание товара (с загрузкой изображения) |
| `PUT` | `/api/products/:id` | Публичный | Полное обновление товара |
| `PATCH` | `/api/products/:id` | Публичный | Частичное обновление товара |
| `DELETE` | `/api/products/:id` | Публичный | Удаление товара |

### Пользователи и Администрирование (`/api/users`, `/admin`)

| Метод | Эндпоинт | Доступ | Описание |
|---|---|---|---|
| `GET` | `/api/users` | `MODERATOR`, `ADMIN` | Список всех пользователей с пагинацией |
| `GET` | `/api/users/:id` | Публичный | Профиль пользователя и его посты |
| `POST` | `/api/users` | `ADMIN` | Создание пользователя |
| `PATCH` | `/api/users/:id` | `ADMIN` | Редактирование пользователя |
| `DELETE` | `/api/users/:id` | `ADMIN` | Удаление пользователя |
| `PATCH` | `/admin/users/:id/role` | `ADMIN` | Изменение роли пользователя (`USER`, `MODERATOR`, `ADMIN`) |
