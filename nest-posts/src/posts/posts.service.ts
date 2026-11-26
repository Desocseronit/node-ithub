import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  private posts: PostEntity[] = [
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
  private nextId = 2;

  create(createPostDto: CreatePostDto): PostEntity {
    const newPost: PostEntity = {
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

  findAll(): PostEntity[] {
    return this.posts;
  }

  findOne(id: number): PostEntity {
    const post = this.posts.find((item) => item.id === id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto): PostEntity {
    const post = this.findOne(id);
    Object.assign(post, updatePostDto);
    return post;
  }

  remove(id: number): void {
    const index = this.posts.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    this.posts.splice(index, 1);
  }
}
