import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {
    CreateBlogCommand,
    UpdateBlogCommand,
    DeleteBlogCommand,
    CreatePostForBlogCommand,
    UpdatePostByBlogCommand, DeletePostByBlogCommand
} from "./useCase/commands";
import {BlogPostInputModelDto, BlogsInputModelDTO, QueryBlogsDTO} from "../../public/blogs/dto";
import {User} from "../../utils/decorators";
import {Users} from "../../users/entity/users.schema";
import {JwtAccessGuard} from "../../public/auth/guards/jwt-access.guard";
import {BlogsQueryRepository as BloggerQueryRepository} from "./repository/blogs.query-repository";
import {CommentsQueryRepository as BloggerCommentsQueryRepository} from './repository/comments.query-repository';
import {UpdatePostDto} from "./dto";
import {PaginationDto} from "../../utils/dto/pagination.dto";

@Controller('blogger/blogs')
export class BlogsController {
    constructor(
        private commandBus: CommandBus,
        private bloggerQueryRepository: BloggerQueryRepository,
        private bloggerCommentsQueryRepository: BloggerCommentsQueryRepository
    ) {}

    @UseGuards(JwtAccessGuard)
    @Get('comments')
    @HttpCode(HttpStatus.OK)
    async getAllCommentsWithPostByBlog(
        @Query() queryDTO: PaginationDto,
        @User() user: Users
    ) {
        return this.bloggerCommentsQueryRepository.getAllCommentsWithPostByBlog(queryDTO, user.id)
    }

    @UseGuards(JwtAccessGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getBlogs(
        @Query() queryDTO: QueryBlogsDTO,
        @User() user: Users
    ) {
        return this.bloggerQueryRepository.getAllBlogByIdAndUserId(queryDTO, user.id)
    }

    @UseGuards(JwtAccessGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBlog(
        @Body() body: BlogsInputModelDTO,
        @User() user: Users
    ) {
        return this.commandBus.execute(new CreateBlogCommand(body, user))
    }

    @UseGuards(JwtAccessGuard)
    @Post(':blogId/posts')
    @HttpCode(HttpStatus.CREATED)
    async createNewPostByBlog(
        @Param('blogId') id: string,
        @Body() bodyDTO: BlogPostInputModelDto,
        @User() user: Users
    ) {
        return this.commandBus.execute(
            new CreatePostForBlogCommand(id, user.id, bodyDTO)
        )
    }

    @UseGuards(JwtAccessGuard)
    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateBlog(
        @Param('id') id: string,
        @Body() bodyDTO: BlogsInputModelDTO,
        @User() user: Users
    ) {
       await this.commandBus.execute(new UpdateBlogCommand(id, user.id, bodyDTO))
    }

    @UseGuards(JwtAccessGuard)
    @Put(':blogId/posts/:postsId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostsByBlog(
        @Param('blogId') blogId: string,
        @Param('postsId') postsId: string,
        @User() user: Users,
        @Body() bodyDTO: UpdatePostDto
    ) {
        await this.commandBus.execute(new UpdatePostByBlogCommand(blogId, postsId, user.id, bodyDTO))
    }

    @UseGuards(JwtAccessGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(
        @Param('id') id: string,
        @User() user: Users
    ) {
        await this.commandBus.execute(new DeleteBlogCommand(id, user.id))
    }

    @UseGuards(JwtAccessGuard)
    @Delete(':blogId/posts/:postsId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePostsByBlog(
        @Param('blogId') blogId: string,
        @Param('postsId') postsId: string,
        @User() user: Users
    ) {
        await this.commandBus.execute(new DeletePostByBlogCommand(blogId, postsId, user.id))
    }
}