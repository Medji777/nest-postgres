import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreatePostForBlogCommand} from "../commands";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {PostsService} from "../../../../public/posts/posts.service";
import {PostsViewModel} from "../../../../types/posts";
import {BlogService} from "../../blog.service";

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogCommandHandler implements ICommandHandler<CreatePostForBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private postsService: PostsService,
        private blogService: BlogService
    ) {}
    async execute(command: CreatePostForBlogCommand): Promise<PostsViewModel> {
        const {id, userId, bodyDTO} = command;
        const blog = await this.blogService.checkExistAndGet(id, userId);
        return this.postsService.create({
            ...bodyDTO,
            blogId: id,
            blogName: blog.name,
            userId
        });
    }
}