import {Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put, Query, UseGuards} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {BanBlogCommand, BindBlogByUserCommand} from "./useCase/command";
import {BasicGuard} from "../../public/auth/guards/basic.guard";
import {QueryBlogsDTO} from "../../public/blogs/dto";
import {BanBlogInputDto} from "./dto";
import {Paginator} from "../../types/types";
import {BlogsViewModel} from "../../types/blogs";
import {BlogsSqlQueryRepository} from "./repository/blogsSql.query-repository";

@Controller('sa/blogs')
export class SABlogsController {
    constructor(
        private commandBus: CommandBus,
        private blogsSqlQueryRepository: BlogsSqlQueryRepository
    ) {}
    @UseGuards(BasicGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Query() queryDTO: QueryBlogsDTO): Promise<Paginator<BlogsViewModel>> {
        return this.blogsSqlQueryRepository.getAll(queryDTO)
    }

    @UseGuards(BasicGuard)
    @Put(':id/bind-with-user/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async bindBlogByUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<void> {
        await this.commandBus.execute(
            new BindBlogByUserCommand(id, userId)
        )
    }

    @UseGuards(BasicGuard)
    @Put(':id/ban')
    @HttpCode(HttpStatus.NO_CONTENT)
    async blogUnbanBlog(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() bodyDTO: BanBlogInputDto
    ): Promise<void> {
        await this.commandBus.execute(
            new BanBlogCommand(id, bodyDTO)
        )
    }
}