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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const post_entity_1 = require("./entities/post.entity");
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    create(createPostDto) {
        return this.postsService.create(createPostDto);
    }
    findAll() {
        return this.postsService.findAll();
    }
    findOne(id) {
        return this.postsService.findOne(id);
    }
    update(id, updatePostDto) {
        return this.postsService.update(id, updatePostDto);
    }
    remove(id) {
        this.postsService.remove(id);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Создать новый пост' }),
    (0, swagger_1.ApiBody)({ type: create_post_dto_1.CreatePostDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Пост успешно создан', type: post_entity_1.PostEntity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ошибка валидации входных данных' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", post_entity_1.PostEntity)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить список всех постов' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список постов', type: [post_entity_1.PostEntity] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить пост по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID поста', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Найденный пост', type: post_entity_1.PostEntity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный формат ID' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пост не найден' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", post_entity_1.PostEntity)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить пост по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID поста', example: 1 }),
    (0, swagger_1.ApiBody)({ type: update_post_dto_1.UpdatePostDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Пост успешно обновлён', type: post_entity_1.PostEntity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Ошибка валидации' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пост не найден' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", post_entity_1.PostEntity)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить пост по ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID поста', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Пост успешно удалён' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Некорректный формат ID' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пост не найден' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "remove", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map