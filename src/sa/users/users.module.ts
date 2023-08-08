import {CqrsModule} from "@nestjs/cqrs";
import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {SAUsersController} from "./users.controller";
import {UsersService} from "./users.service";
import {
    CreateUserCommandHandler,
    DeleteUserCommandHandler,
    BanUserSqlCommandHandler
} from "./useCase/handlers";
import {CommandRepository} from "./repository/command.repository";
import {PassHashService} from "../../applications/passHash.service";
import {Users, UsersSchema} from "../../users/entity/users.schema";
import {PaginationService} from "../../applications/pagination.service";
import {BasicStrategy} from "../../public/auth/strategies/basic.strategy";
import {UsersRepository} from "../../users/repository/users.repository";
import {UsersQueryRepository} from "../../users/repository/users.query-repository";
import {SecurityRepository} from "../../public/security/repository/security.repository";
import {Security, SecuritySchema} from "../../public/security/entity/security.schema";
import {Comments, CommentsSchema} from "../../public/comments/entity/comments.schema";
import {CommentsLike, CommentsLikeSchema} from "../../public/comments/like/entity/commentsLike.schema";
import {PostsLike, PostsLikeSchema} from "../../public/posts/like/entity/postsLike.schema";
import {CommentsRepository} from "../../public/comments/repository/comments.repository";
import {PostsRepository} from "../../public/posts/repository/posts.repository";
import {Posts, PostsSchema} from "../../public/posts/entity/posts.schema";
import {LikeCalculateService} from "../../applications/likeCalculate.service";
import {BlogsRepository} from "../../public/blogs/repository/blogs.repository";
import {Blogs, BlogsSchema} from "../../public/blogs/entity/blogs.schema";
import {UsersSqlQueryRepository} from "../../users/repository/users-sql.query-repository";
import {UsersSqlRepository} from "../../users/repository/users-sql.repository";
import {SecuritySqlRepository} from "../../public/security/repository/securitySql.repository";
import {PostsSqlRepository} from "../../public/posts/repository/postsSql.repository";
import {CommentsSqlRepository} from "../../public/comments/repository/commentsSql.repository";

const CommandHandlers = [
    CreateUserCommandHandler,
    DeleteUserCommandHandler,
    //BanUserCommandHandler,
    BanUserSqlCommandHandler
]
const Repository = [
    UsersRepository,
    UsersQueryRepository,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    SecuritySqlRepository,
    SecurityRepository,
    CommentsRepository,
    CommentsSqlRepository,
    PostsRepository,
    PostsSqlRepository,
    CommandRepository,
    BlogsRepository
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: Users.name, schema: UsersSchema },
            { name: Security.name, schema: SecuritySchema },
            { name: Blogs.name, schema: BlogsSchema },
            { name: Comments.name, schema: CommentsSchema },
            { name: CommentsLike.name, schema: CommentsLikeSchema },
            { name: Posts.name, schema: PostsSchema },
            { name: PostsLike.name, schema: PostsLikeSchema }
        ]),
    ],
    controllers: [SAUsersController],
    providers: [
        PaginationService,
        PassHashService,
        LikeCalculateService,
        UsersService,
        BasicStrategy,
        ...Repository,
        ...CommandHandlers
    ]
})
export class SAUsersModule {}