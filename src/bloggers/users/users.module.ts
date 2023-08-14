import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {BloggerUsersController} from "./users.controller";
import {BanUserCommandHandler} from "./useCase/handlers";
import {PaginationService} from "../../applications/pagination.service";
import {JwtAccessStrategy} from "../../public/auth/strategies/jwt-access.strategy";
import {UsersModule} from "../../users/users.module";
import {BlogsUsersBanSqlRepository} from "./repository/blogsUsersBanSql.repository";
import {BlogsUsersBanSqlQueryRepository} from "./repository/blogsUsersBanSql.query-repository";
import {BlogsSqlRepository} from "../../public/blogs/repository/blogsSql.repository";

@Module({
    imports: [
        CqrsModule,
        UsersModule
    ],
    controllers: [BloggerUsersController],
    providers: [
        JwtAccessStrategy,
        BlogsSqlRepository,
        BlogsUsersBanSqlRepository,
        BlogsUsersBanSqlQueryRepository,
        BanUserCommandHandler,
        PaginationService
    ]
})
export class BloggerUsersModule {}