import {Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put, Query, UseGuards} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {BanUnbanInputDto, QueryUsersDto} from "./dto";
import {JwtAccessGuard} from "../../public/auth/guards/jwt-access.guard";
import {User} from "../../utils/decorators";
import {Users} from "../../users/entity/users.schema";
import {BanUserCommand} from "./useCase/command";
import {BlogsUsersBanSqlQueryRepository} from "./repository/blogsUsersBanSql.query-repository";

@Controller('blogger/users')
export class BloggerUsersController {
    constructor(
        private commandBus: CommandBus,
        private blogsUsersBanSqlQueryRepository: BlogsUsersBanSqlQueryRepository
    ) {}
    @UseGuards(JwtAccessGuard)
    @Get('blog/:id')
    @HttpCode(HttpStatus.OK)
    async getAllBannedUsersForBlog(
        @Query() queryDTO: QueryUsersDto,
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: Users
    ) {
        return this.blogsUsersBanSqlQueryRepository
            .getBannedUserByBlogId(id, user.id, queryDTO)
    }

    @UseGuards(JwtAccessGuard)
    @Put(':id/ban')
    @HttpCode(HttpStatus.NO_CONTENT)
    async banUnbanFlow(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() bodyDTO: BanUnbanInputDto,
        @User() user: Users
    ) {
        await this.commandBus.execute(
            new BanUserCommand(id, user, bodyDTO)
        )
    }
}