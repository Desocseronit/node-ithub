import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PostEntity } from './posts/entities/post.entity';
import { CreatePostDto } from './posts/dto/create-post.dto';
import { UpdatePostDto } from './posts/dto/update-post.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальная валидация через class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Posts API (NestJS)')
    .setDescription('CRUD API для модуля Posts с полной документацией (КТ5)')
    .setVersion('1.0')
    .addTag('Posts')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PostEntity, CreatePostDto, UpdatePostDto],
  });

  // Документация доступна по /api/docs
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger docs available at: http://localhost:3000/api/docs`);
}
bootstrap();
