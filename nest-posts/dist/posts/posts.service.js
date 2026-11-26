"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
let PostsService = class PostsService {
    posts = [
        {
            id: 1,
            title: 'Добро пожаловать в NestJS',
            content: 'Первый тестовый пост в модуле Posts',
            published: true,
            authorId: 1,
            tags: ['nestjs', 'docs'],
            createdAt: new Date(),
        },
    ];
    nextId = 2;
    create(createPostDto) {
        const newPost = {
            id: this.nextId++,
            title: createPostDto.title,
            content: createPostDto.content ?? null,
            published: createPostDto.published ?? false,
            authorId: createPostDto.authorId,
            tags: createPostDto.tags ?? [],
            createdAt: new Date(),
        };
        this.posts.push(newPost);
        return newPost;
    }
    findAll() {
        return this.posts;
    }
    findOne(id) {
        const post = this.posts.find((item) => item.id === id);
        if (!post) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        return post;
    }
    update(id, updatePostDto) {
        const post = this.findOne(id);
        Object.assign(post, updatePostDto);
        return post;
    }
    remove(id) {
        const index = this.posts.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException(`Post with id ${id} not found`);
        }
        this.posts.splice(index, 1);
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)()
], PostsService);
//# sourceMappingURL=posts.service.js.map