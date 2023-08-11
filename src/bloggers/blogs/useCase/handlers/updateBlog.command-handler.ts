import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateBlogCommand} from "../commands";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";
import {BlogService} from "../../blog.service";

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogCommandHandler implements ICommandHandler<UpdateBlogCommand> {
    constructor(
        private blogsSqlRepository: BlogsSqlRepository,
        private blogService: BlogService
    ) {}
    async execute(command: UpdateBlogCommand): Promise<any> {
        const {id, userId, bodyDTO} = command
        const blog = await this.blogService.checkExistAndGet(id, userId)
        await this.blogsSqlRepository.update(blog.id, bodyDTO)
    }
}