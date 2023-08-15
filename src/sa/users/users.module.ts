import {CqrsModule} from "@nestjs/cqrs";
import {Module} from "@nestjs/common";
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
    CommentsSqlRepository,
    PostsSqlRepository,
]

@Module({
    imports: [
        CqrsModule,
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