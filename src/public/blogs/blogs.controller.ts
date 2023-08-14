import {
  Controller,
  Param,
  Query,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  QueryBlogsDTO,
  QueryPostsDto,
} from './dto';
import { GetUserInterceptor } from '../auth/interceptors/getUser.interceptor';
import {User} from "../../utils/decorators";
import {BlogsSqlQueryRepository} from "./repository/blogsSql.query-repository";
import {UsersSqlType} from "../../types/sql/user.sql";
import {PostsSqlQueryRepository} from "../posts/repository/postsSql.query-repository";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: QueryBlogsDTO) {
    return this.blogsSqlQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogOnId(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogsSqlQueryRepository.findById(id);
  }

  @Get(':blogId/posts')
  @UseInterceptors(GetUserInterceptor)
  async getPostByBlogIdWithQuery(
    @Param('blogId', ParseUUIDPipe) id: string,
    @Query() query: QueryPostsDto,
    @User() user: UsersSqlType,
  ) {
    await this.blogsSqlQueryRepository.findById(id);
    return this.postsSqlQueryRepository.getPostsByBlogId(id, query, user?.id);
  }
}
