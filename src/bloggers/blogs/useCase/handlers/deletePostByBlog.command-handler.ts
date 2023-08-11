import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {DeletePostByBlogCommand} from "../commands";
import {PostsSqlRepository} from "../../../../public/posts/repository/postsSql.repository";
import {BlogService} from "../../blog.service";

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogCommandHandler implements ICommandHandler<DeletePostByBlogCommand> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private blogService: BlogService
    ) {}
    async execute(command: DeletePostByBlogCommand): Promise<any> {
        const {blogId, postId, userId} = command;
        await this.blogService.checkExistAndGet(blogId, userId)
        const post = await this.postsSqlRepository.findByIdAndBlogId(postId, blogId);
        if(!post) throw new NotFoundException();
        await this.postsSqlRepository.deleteOne(post.id)
    }
}