import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый пост' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Пост успешно создан', type: PostEntity })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входных данных' })
  create(@Body() createPostDto: CreatePostDto): PostEntity {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех постов' })
  @ApiResponse({ status: 200, description: 'Список постов', type: [PostEntity] })
  findAll(): PostEntity[] {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пост по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiResponse({ status: 200, description: 'Найденный пост', type: PostEntity })
  @ApiResponse({ status: 400, description: 'Некорректный формат ID' })
  @ApiResponse({ status: 404, description: 'Пост не найден' })
  findOne(@Param('id', ParseIntPipe) id: number): PostEntity {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пост по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Пост успешно обновлён', type: PostEntity })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Пост не найден' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): PostEntity {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить пост по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiResponse({ status: 204, description: 'Пост успешно удалён' })
  @ApiResponse({ status: 400, description: 'Некорректный формат ID' })
  @ApiResponse({ status: 404, description: 'Пост не найден' })
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.postsService.remove(id);
  }
}
