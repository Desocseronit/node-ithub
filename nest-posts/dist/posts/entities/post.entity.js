"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
let PostEntity = class PostEntity {
    id;
    title;
    content;
    published;
    authorId;
    tags;
    createdAt;
};
exports.PostEntity = PostEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Уникальный ID поста' }),
    __metadata("design:type", Number)
], PostEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Мой первый пост на NestJS', description: 'Заголовок поста' }),
    __metadata("design:type", String)
], PostEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Подробный текст поста...',
        description: 'Содержимое поста',
        required: false,
        nullable: true,
    }),
    __metadata("design:type", Object)
], PostEntity.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Статус публикации', default: false }),
    __metadata("design:type", Boolean)
], PostEntity.prototype, "published", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID автора поста' }),
    __metadata("design:type", Number)
], PostEntity.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['nestjs', 'swagger'], description: 'Список тегов', type: [String] }),
    __metadata("design:type", Array)
], PostEntity.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-11-26T10:00:00.000Z', description: 'Дата создания' }),
    __metadata("design:type", Date)
], PostEntity.prototype, "createdAt", void 0);
exports.PostEntity = PostEntity = __decorate([
    (0, swagger_1.ApiSchema)({ name: 'Post' })
], PostEntity);
//# sourceMappingURL=post.entity.js.map