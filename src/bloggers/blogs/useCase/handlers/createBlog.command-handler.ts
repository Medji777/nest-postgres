import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateBlogCommand} from "../commands";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {BlogDocument} from "../../../../public/blogs/entity/blogs.schema";
import {BlogsViewModel} from "../../../../types/blogs";

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler implements ICommandHandler<CreateBlogCommand> {
    constructor(private readonly blogsRepository: BlogsRepository) {}
    async execute(command: CreateBlogCommand): Promise<any> {
        const {blogDto, user} = command;
        const createdBlog = this.blogsRepository.create(
            blogDto.name,
            blogDto.description,
            blogDto.websiteUrl,
            user.id,
            user.login,
            false,
        );
        await this.blogsRepository.save(createdBlog);
        return this.createMapBlogs(createdBlog)
    }

    private createMapBlogs(model: BlogDocument): BlogsViewModel {
        return {
            id: model.id,
            name: model.name,
            description: model.description,
            websiteUrl: model.websiteUrl,
            createdAt: model.createdAt,
            isMembership: model.isMembership,
        };
    }
}