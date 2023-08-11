import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {BanBlogCommand} from "../command";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";

@CommandHandler(BanBlogCommand)
export class BanBlogCommandHandler implements ICommandHandler<BanBlogCommand> {
    constructor(private blogsSqlRepository: BlogsSqlRepository) {}
    async execute(command: BanBlogCommand): Promise<void> {
        const {blogId, bodyDTO} = command;

        const blog = await this.blogsSqlRepository.findById(blogId)
        if(!blog) throw new NotFoundException('blog not found')
        await this.blogsSqlRepository.updateBan(blogId,bodyDTO.isBanned)
    }
}