import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'Post' })
export class PostEntity {
  @ApiProperty({ example: 1, description: 'Уникальный ID поста' })
  id: number;

  @ApiProperty({ example: 'Мой первый пост на NestJS', description: 'Заголовок поста' })
  title: string;

  @ApiProperty({
    example: 'Подробный текст поста...',
    description: 'Содержимое поста',
    required: false,
    nullable: true,
  })
  content?: string | null;

  @ApiProperty({ example: false, description: 'Статус публикации', default: false })
  published: boolean;

  @ApiProperty({ example: 1, description: 'ID автора поста' })
  authorId: number;

  @ApiProperty({ example: ['nestjs', 'swagger'], description: 'Список тегов', type: [String] })
  tags: string[];

  @ApiProperty({ example: '2026-11-26T10:00:00.000Z', description: 'Дата создания' })
  createdAt: Date;
}
