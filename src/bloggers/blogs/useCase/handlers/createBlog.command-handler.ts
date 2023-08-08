import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateBlogCommand} from "../commands";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";
import {BlogsViewModel} from "../../../../types/blogs";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";
import {BlogsSqlType} from "../../../../types/sql/blogs.sql";

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler implements ICommandHandler<CreateBlogCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly blogsSqlRepository: BlogsSqlRepository
    ) {}
    async execute(command: CreateBlogCommand): Promise<any> {
        const {blogDto, user} = command;
        const createdBlog = await this.blogsSqlRepository.create(
            blogDto.name,
            blogDto.description,
            blogDto.websiteUrl,
            user.id
        )
        return this.createMapBlogs(createdBlog)
    }

    private createMapBlogs(model: BlogsSqlType): BlogsViewModel {
        return {
            id: model.id,
            name: model.name,
            description: model.description,
            websiteUrl: model.websiteUrl,
            createdAt: model.createdAt.toISOString(),
            isMembership: model.isMembership,
        };
    }
}