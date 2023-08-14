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
import {PassHashService} from "../../applications/passHash.service";
import {PaginationService} from "../../applications/pagination.service";
import {BasicStrategy} from "../../public/auth/strategies/basic.strategy";
import {Comments, CommentsSchema} from "../../public/comments/entity/comments.schema";
import {CommentsLike, CommentsLikeSchema} from "../../public/comments/like/entity/commentsLike.schema";
import {CommentsRepository} from "../../public/comments/repository/comments.repository";
import {PostsRepository} from "../../public/posts/repository/posts.repository";
import {Posts, PostsSchema} from "../../public/posts/entity/posts.schema";
import {LikeCalculateService} from "../../applications/likeCalculate.service";
import {UsersSqlQueryRepository} from "../../users/repository/users-sql.query-repository";
import {UsersSqlRepository} from "../../users/repository/users-sql.repository";
import {SecuritySqlRepository} from "../../public/security/repository/securitySql.repository";
import {PostsSqlRepository} from "../../public/posts/repository/postsSql.repository";
import {CommentsSqlRepository} from "../../public/comments/repository/commentsSql.repository";

const CommandHandlers = [
    CreateUserCommandHandler,
    DeleteUserCommandHandler,
    BanUserSqlCommandHandler
]
const Repository = [
    UsersSqlRepository,
    UsersSqlQueryRepository,
    SecuritySqlRepository,
    CommentsRepository,
    CommentsSqlRepository,
    PostsRepository,
    PostsSqlRepository,
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: Comments.name, schema: CommentsSchema },
            { name: CommentsLike.name, schema: CommentsLikeSchema },
            { name: Posts.name, schema: PostsSchema },
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