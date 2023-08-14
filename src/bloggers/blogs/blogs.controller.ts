import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
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
import {UsersSqlType} from "../../types/sql/user.sql";
import {JwtAccessGuard} from "../../public/auth/guards/jwt-access.guard";
import {BlogsSqlQueryRepository as BloggerQueryRepository} from "../../public/blogs/repository/blogsSql.query-repository";
import {CommentsSqlQueryRepository as BloggerCommentsQueryRepository} from "./repository/commentsSql.query-repository";
import {UpdatePostDto} from "./dto";
import {PaginationDto} from "../../utils/dto/pagination.dto";

@Controller('blogger/blogs')
export class BlogsController {
    constructor(
        private commandBus: CommandBus,
        private bloggerSqlQueryRepository: BloggerQueryRepository,
        private bloggerCommentsSqlQueryRepository: BloggerCommentsQueryRepository
    ) {}

    @UseGuards(JwtAccessGuard)
    @Get('comments')
    @HttpCode(HttpStatus.OK)
    async getAllCommentsWithPostByBlog(
        @Query() queryDTO: PaginationDto,
        @User() user: UsersSqlType
    ) {
        return this.bloggerCommentsSqlQueryRepository
            .getAllCommentsWithPostByBlog(queryDTO, user.id)
    }

    @UseGuards(JwtAccessGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getBlogs(
        @Query() queryDTO: QueryBlogsDTO,
        @User() user: UsersSqlType
    ) {
        return this.bloggerSqlQueryRepository.getAll(queryDTO, user.id)
    }

    @UseGuards(JwtAccessGuard)
    @Get(':blogId/posts')
    @HttpCode(HttpStatus.OK)
    async getPostsForBlog(
        @Param('blogId', ParseUUIDPipe) id: string,
        @Query() queryDTO: PaginationDto,
        @User() user: UsersSqlType
    ) {

    }

    @UseGuards(JwtAccessGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBlog(
        @Body() body: BlogsInputModelDTO,
        @User() user: UsersSqlType
    ) {
        return this.commandBus.execute(
            new CreateBlogCommand(body, user)
        )
    }

    @UseGuards(JwtAccessGuard)
    @Post(':blogId/posts')
    @HttpCode(HttpStatus.CREATED)
    async createNewPostByBlog(
        @Param('blogId', ParseUUIDPipe) id: string,
        @Body() bodyDTO: BlogPostInputModelDto,
        @User() user: UsersSqlType
    ) {
        return this.commandBus.execute(
            new CreatePostForBlogCommand(id, user.id, bodyDTO)
        )
    }

    @UseGuards(JwtAccessGuard)
    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateBlog(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() bodyDTO: BlogsInputModelDTO,
        @User() user: UsersSqlType
    ) {
       await this.commandBus.execute(
           new UpdateBlogCommand(id, user.id, bodyDTO)
       )
    }

    @UseGuards(JwtAccessGuard)
    @Put(':blogId/posts/:postsId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostsByBlog(
        @Param('blogId', ParseUUIDPipe) blogId: string,
        @Param('postsId', ParseUUIDPipe) postsId: string,
        @User() user: UsersSqlType,
        @Body() bodyDTO: UpdatePostDto
    ) {
        await this.commandBus.execute(
            new UpdatePostByBlogCommand(blogId, postsId, user.id, bodyDTO)
        )
    }

    @UseGuards(JwtAccessGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: UsersSqlType
    ) {
        await this.commandBus.execute(
            new DeleteBlogCommand(id, user.id)
        )
    }

    @UseGuards(JwtAccessGuard)
    @Delete(':blogId/posts/:postsId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePostsByBlog(
        @Param('blogId', ParseUUIDPipe) blogId: string,
        @Param('postsId', ParseUUIDPipe) postsId: string,
        @User() user: UsersSqlType
    ) {
        await this.commandBus.execute(
            new DeletePostByBlogCommand(blogId, postsId, user.id)
        )
    }
}