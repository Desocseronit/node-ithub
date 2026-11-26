"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const post_entity_1 = require("./posts/entities/post.entity");
const create_post_dto_1 = require("./posts/dto/create-post.dto");
const update_post_dto_1 = require("./posts/dto/update-post.dto");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Posts API (NestJS)')
        .setDescription('CRUD API для модуля Posts с полной документацией (КТ5)')
        .setVersion('1.0')
        .addTag('Posts')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        extraModels: [post_entity_1.PostEntity, create_post_dto_1.CreatePostDto, update_post_dto_1.UpdatePostDto],
    });
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: http://localhost:3000`);
    console.log(`Swagger docs available at: http://localhost:3000/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map