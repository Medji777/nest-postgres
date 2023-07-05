import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {MongooseModule} from "@nestjs/mongoose";
import {SABlogsController} from "./blogs.controller";
import {Blogs, BlogsSchema} from "../../public/blogs/entity/blogs.schema";
import {PaginationService} from "../../applications/pagination.service";
import {BanBlogCommandHandler, BindBlogByUserCommandHandler} from "./useCase/handler";
import {BlogsRepository} from "../../public/blogs/repository/blogs.repository";
import {UsersRepository} from "../../users/repository/users.repository";
import {Users, UsersSchema} from "../../users/entity/users.schema";
import {BlogsQueryRepository} from "./repository/blogs.query-repository";
import {PostsRepository} from "../../public/posts/repository/posts.repository";
import {Posts, PostsSchema} from "../../public/posts/entity/posts.schema";
import {BasicStrategy} from "../../public/auth/strategies/basic.strategy";

const CommandHandlers = [BindBlogByUserCommandHandler, BanBlogCommandHandler]
const Repository = [BlogsRepository, UsersRepository, BlogsQueryRepository, PostsRepository]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: Blogs.name, schema: BlogsSchema },
            { name: Users.name, schema: UsersSchema},
            { name: Posts.name, schema: PostsSchema }
        ])
    ],
    controllers: [SABlogsController],
    providers: [
        BasicStrategy,
        PaginationService,
        ...Repository,
        ...CommandHandlers
    ]
})
export class SABlogsModule {}