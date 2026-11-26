export declare class PostEntity {
    id: number;
    title: string;
    content?: string | null;
    published: boolean;
    authorId: number;
    tags: string[];
    createdAt: Date;
}
