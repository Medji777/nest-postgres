import {Module} from "@nestjs/common";
import {CqrsModule} from '@nestjs/cqrs';
import {MongooseModule} from "@nestjs/mongoose";
import {
    CreateBlogCommandHandler,
    UpdateBlogCommandHandler,
    DeleteBlogCommandHandler,
    CreatePostForBlogCommandHandler,
    UpdatePostByBlogCommandHandler,
    DeletePostByBlogCommandHandler
} from "./useCase/handlers";
import {Comments, CommentsSchema} from "../../public/comments/entity/comments.schema";
import {BlogsController} from "./blogs.controller";
import {PaginationService} from "../../applications/pagination.service";
import {CommentsQueryRepository} from "./repository/comments.query-repository";
import {PostsModule} from "../../public/posts/posts.module";
import {BlogService} from "./blog.service";
import {Posts, PostsSchema} from "../../public/posts/entity/posts.schema";
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
        MongooseModule.forFeature([
            { name: Comments.name, schema: CommentsSchema },
            { name: Posts.name, schema: PostsSchema},
        ]),
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
        CommentsQueryRepository,
        CommentsSqlQueryRepository,
        PostsSqlRepository,
        PaginationService,
    ]
})
export class BloggerBlogModule {}