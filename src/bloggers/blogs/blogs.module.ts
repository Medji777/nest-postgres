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
import {BlogsRepository} from "../../public/blogs/repository/blogs.repository";
import {Blogs, BlogsSchema} from "../../public/blogs/entity/blogs.schema";
import {Comments, CommentsSchema} from "../../public/comments/entity/comments.schema";
import {BlogsController} from "./blogs.controller";
import {PaginationService} from "../../applications/pagination.service";
import {BlogsQueryRepository} from "./repository/blogs.query-repository";
import {CommentsQueryRepository} from "./repository/comments.query-repository";
import {BloggerBlogsRepository} from "./repository/blogs.repository";
import {PostsModule} from "../../public/posts/posts.module";
import {BlogService} from "./blog.service";
import {Posts, PostsSchema} from "../../public/posts/entity/posts.schema";
import {JwtAccessStrategy} from "../../public/auth/strategies/jwt-access.strategy";
import {UsersModule} from "../../users/users.module";

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
            { name: Blogs.name, schema: BlogsSchema },
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
        BlogsRepository,
        BlogsQueryRepository,
        BloggerBlogsRepository,
        CommentsQueryRepository,
        PaginationService,
    ]
})
export class BloggerBlogModule {}