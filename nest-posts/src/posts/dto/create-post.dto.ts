import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Мой первый пост',
    description: 'Заголовок поста (от 2 до 50 символов)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({
    example: 'Текст поста...',
    description: 'Содержимое поста (от 2 до 500 символов)',
    minLength: 2,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  content?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Опубликован ли пост',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID автора поста',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  authorId: number;

  @ApiPropertyOptional({
    example: ['nestjs', 'typescript'],
    description: 'Массив тегов',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
