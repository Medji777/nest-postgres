import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {BloggerUsersController} from "./users.controller";
import {BanUserCommandHandler} from "./useCase/handlers";
import {UsersRepository} from "../../users/repository/users.repository";
import {BlogsRepository} from "../../public/blogs/repository/blogs.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Users, UsersSchema} from "../../users/entity/users.schema";
import {Blogs, BlogsSchema} from "../../public/blogs/entity/blogs.schema";
import {UsersQueryRepository} from "./repository/users.query-repository";
import {PaginationService} from "../../applications/pagination.service";
import {JwtAccessStrategy} from "../../public/auth/strategies/jwt-access.strategy";
import {UsersModule} from "../../users/users.module";

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: Users.name, schema: UsersSchema },
            { name: Blogs.name, schema: BlogsSchema }
        ]),
        UsersModule
    ],
    controllers: [BloggerUsersController],
    providers: [
        JwtAccessStrategy,
        UsersRepository,
        BlogsRepository,
        UsersQueryRepository,
        BanUserCommandHandler,
        PaginationService
    ]
})
export class BloggerUsersModule {}