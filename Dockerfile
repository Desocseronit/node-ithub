FROM node:20-alpine

WORKDIR /app

# Копируем манифесты зависимостей и конфиги Prisma
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальной исходный код
COPY . .

# Генерируем клиент Prisma и актуальный Swagger JSON
RUN npx prisma generate
RUN npm run swagger

EXPOSE 3000

# При старте контейнера применяем миграции к PostgreSQL и запускаем сервер
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
