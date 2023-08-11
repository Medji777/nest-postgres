import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteBlogCommand} from "../commands";
import {BlogService} from "../../blog.service";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogCommandHandler implements ICommandHandler<DeleteBlogCommand> {
    constructor(
        private blogsSqlRepository: BlogsSqlRepository,
        private blogService: BlogService
    ) {}
    async execute(command: DeleteBlogCommand): Promise<void> {
        const {id, userId} = command;
        await this.blogService.checkExistAndGet(id, userId);
        await this.blogsSqlRepository.deleteById(id);
    }
}