import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteBlogCommand} from "../commands";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {BlogService} from "../../blog.service";

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogCommandHandler implements ICommandHandler<DeleteBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private blogService: BlogService
    ) {}
    async execute(command: DeleteBlogCommand): Promise<void> {
        const {id, userId} = command;
        const blog = await this.blogService.checkExistAndGet(id, userId);
        blog.deleteOne()
        // await this.blogsRepository.deleteById(id);
    }
}