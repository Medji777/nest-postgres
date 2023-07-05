import {Body, Controller, Get, HttpCode, HttpStatus, Param, Put, Query, UseGuards} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {BanBlogCommand, BindBlogByUserCommand} from "./useCase/command";
import {BlogsQueryRepository} from "./repository/blogs.query-repository";
import {BasicGuard} from "../../public/auth/guards/basic.guard";
import {QueryBlogsDTO} from "../../public/blogs/dto";
import {BanBlogInputDto} from "./dto";
import {Paginator} from "../../types/types";
import {BlogsViewModel} from "../../types/blogs";

@Controller('sa/blogs')
export class SABlogsController {
    constructor(
        private commandBus: CommandBus,
        private blogsQueryRepository: BlogsQueryRepository,
    ) {}
    @UseGuards(BasicGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Query() queryDTO: QueryBlogsDTO): Promise<Paginator<BlogsViewModel>> {
        return this.blogsQueryRepository.getAll(queryDTO)
    }

    @UseGuards(BasicGuard)
    @Put(':id/bind-with-user/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async bindBlogByUser(
        @Param('id') id: string,
        @Param('userId') userId: string
    ): Promise<void> {
        await this.commandBus.execute(
            new BindBlogByUserCommand(id, userId)
        )
    }

    @UseGuards(BasicGuard)
    @Put(':id/ban')
    @HttpCode(HttpStatus.NO_CONTENT)
    async blogUnbanBlog(
        @Param('id') id: string,
        @Body() bodyDTO: BanBlogInputDto
    ): Promise<void> {
        await this.commandBus.execute(
            new BanBlogCommand(id, bodyDTO)
        )
    }
}