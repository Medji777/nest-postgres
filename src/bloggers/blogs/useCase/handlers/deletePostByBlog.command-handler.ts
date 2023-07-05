import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {DeletePostByBlogCommand} from "../commands";
import {PostsRepository} from "../../../../public/posts/repository/posts.repository";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {BlogService} from "../../blog.service";

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogCommandHandler implements ICommandHandler<DeletePostByBlogCommand> {
    constructor(
        private postsRepository: PostsRepository,
        private blogRepository: BlogsRepository,
        private blogService: BlogService
    ) {}
    async execute(command: DeletePostByBlogCommand): Promise<any> {
        const {blogId, postId, userId} = command;
        await this.blogService.checkExistAndGet(blogId, userId)
        const post = await this.postsRepository.findByIdAndBlogId(postId, blogId);
        if(!post) {
            throw new NotFoundException()
        }
        post.deleteOne()
    }
}