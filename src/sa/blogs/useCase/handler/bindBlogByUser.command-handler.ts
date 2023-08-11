import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException} from "@nestjs/common";
import {BindBlogByUserCommand} from "../command";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";

@CommandHandler(BindBlogByUserCommand)
export class BindBlogByUserCommandHandler implements ICommandHandler<BindBlogByUserCommand> {
    constructor(
        private blogsSqlRepository: BlogsSqlRepository,
        private usersSqlRepository: UsersSqlRepository,
    ) {}
    async execute(command: BindBlogByUserCommand): Promise<void> {
        const {blogId, userId} = command;

        const blog = await this.blogsSqlRepository.findById(blogId);
        const user = await this.usersSqlRepository.findById(userId);
        if(!blog || !user) {
            throw new BadRequestException('Request not corrected')
        }
        if(blog.userId !== null) {
            throw new BadRequestException('Request not corrected')
        }
        await this.blogsSqlRepository.updateBindUser(blogId,userId)
    }
}