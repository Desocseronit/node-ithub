import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto): PostEntity;
    findAll(): PostEntity[];
    findOne(id: number): PostEntity;
    update(id: number, updatePostDto: UpdatePostDto): PostEntity;
    remove(id: number): void;
}
