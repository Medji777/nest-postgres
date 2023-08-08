import {
  Controller,
  Param,
  Query,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import { PostsQueryRepository } from '../posts/repository/posts.query-repository';
import {
  QueryBlogsDTO,
  QueryPostsDto,
} from './dto';
import { GetUserInterceptor } from '../auth/interceptors/getUser.interceptor';
import {User} from "../../utils/decorators";
import {Users} from "../../users/entity/users.schema";
import {BlogsSqlQueryRepository} from "./repository/blogsSql.query-repository";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
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
    @User() user: Users,
  ) {
    await this.blogsSqlQueryRepository.findById(id);
    return this.postsQueryRepository.getPostsByBlogId(id, query, user?.id);
  }
}
