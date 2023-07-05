import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateBlogCommand} from "../commands";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {BlogService} from "../../blog.service";

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogCommandHandler implements ICommandHandler<UpdateBlogCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private blogService: BlogService
    ) {}
    async execute(command: UpdateBlogCommand): Promise<any> {
        const {id, userId, bodyDTO} = command
        const blog = await this.blogService.checkExistAndGet(id, userId)
        blog.update(bodyDTO);
        await this.blogsRepository.save(blog);
    }
}