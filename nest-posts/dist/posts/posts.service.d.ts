import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
export declare class PostsService {
    private posts;
    private nextId;
    create(createPostDto: CreatePostDto): PostEntity;
    findAll(): PostEntity[];
    findOne(id: number): PostEntity;
    update(id: number, updatePostDto: UpdatePostDto): PostEntity;
    remove(id: number): void;
}
