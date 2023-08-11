import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {SABlogsController} from "./blogs.controller";
import {PaginationService} from "../../applications/pagination.service";
import {BanBlogCommandHandler, BindBlogByUserCommandHandler} from "./useCase/handler";
import {BasicStrategy} from "../../public/auth/strategies/basic.strategy";
import {BlogsSqlRepository} from "../../public/blogs/repository/blogsSql.repository";
import {UsersSqlRepository} from "../../users/repository/users-sql.repository";
import {BlogsSqlQueryRepository} from "./repository/blogsSql.query-repository";

const CommandHandlers = [BindBlogByUserCommandHandler, BanBlogCommandHandler]
const Repository = [BlogsSqlRepository, UsersSqlRepository, BlogsSqlQueryRepository]

@Module({
    imports: [CqrsModule],
    controllers: [SABlogsController],
    providers: [
        BasicStrategy,
        PaginationService,
        ...Repository,
        ...CommandHandlers
    ]
})
export class SABlogsModule {}