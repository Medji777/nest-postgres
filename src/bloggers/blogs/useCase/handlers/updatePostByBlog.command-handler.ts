import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {UpdatePostByBlogCommand} from "../commands";
import {BlogService} from "../../blog.service";
import {PostsSqlRepository} from "../../../../public/posts/repository/postsSql.repository";

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogCommandHandler implements ICommandHandler<UpdatePostByBlogCommand> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private blogService: BlogService
    ) {}
    async execute(command: UpdatePostByBlogCommand): Promise<any> {
        const {blogId, postId, userId, bodyDTO} = command;
        await this.blogService.checkExistAndGet(blogId, userId);
        const post = await this.postsSqlRepository.findByIdAndBlogId(postId, blogId)
        if(!post) throw new NotFoundException()
        await this.postsSqlRepository.update(post.id,{...bodyDTO, blogId})
    }
}