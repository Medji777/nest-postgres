import {Module} from "@nestjs/common";
import {CqrsModule} from '@nestjs/cqrs';
import {
    CreateBlogCommandHandler,
    UpdateBlogCommandHandler,
    DeleteBlogCommandHandler,
    CreatePostForBlogCommandHandler,
    UpdatePostByBlogCommandHandler,
    DeletePostByBlogCommandHandler
} from "./useCase/handlers";
import {BlogsController} from "./blogs.controller";
import {PaginationService} from "../../applications/pagination.service";
import {PostsModule} from "../../public/posts/posts.module";
import {BlogService} from "./blog.service";
import {JwtAccessStrategy} from "../../public/auth/strategies/jwt-access.strategy";
import {UsersModule} from "../../users/users.module";
import {BlogsSqlRepository} from "../../public/blogs/repository/blogsSql.repository";
import {PostsSqlRepository} from "../../public/posts/repository/postsSql.repository";
import {BlogsSqlQueryRepository} from "../../public/blogs/repository/blogsSql.query-repository";
import {CommentsSqlQueryRepository} from "./repository/commentsSql.query-repository";

const CommandHandlers = [
    CreateBlogCommandHandler,
    UpdateBlogCommandHandler,
    DeleteBlogCommandHandler,
    CreatePostForBlogCommandHandler,
    UpdatePostByBlogCommandHandler,
    DeletePostByBlogCommandHandler
]

@Module({
    imports: [
        CqrsModule,
        PostsModule,
        UsersModule
    ],
    controllers: [BlogsController],
    providers: [
        ...CommandHandlers,
        JwtAccessStrategy,
        BlogService,
        BlogsSqlRepository,
        BlogsSqlQueryRepository,
        CommentsSqlQueryRepository,
        PostsSqlRepository,
        PaginationService,
    ]
})
export class BloggerBlogModule {}