import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { BlogsService } from '../public/blogs/blogs.service';
import { PostsService } from '../public/posts/posts.service';
import { CommentsService } from '../public/comments/comments.service';
import { UsersService } from '../users/users.service';
import { SecurityService } from '../public/security/security.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly blogService: BlogsService,
    private readonly postService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly userService: UsersService,
    private readonly securityService: SecurityService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getHello(): string {
    return this.appService.getInit();
  }

  @Delete('testing/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async testingAllDelete() {
    await this.blogService.deleteAll();
    await this.postService.deleteAll();
    await this.postService.deleteAllLikes();
    await this.commentsService.deleteAll();
    await this.commentsService.deleteAllLikes();
    await this.userService.deleteAll();
    await this.securityService.deleteAll();
  }
}
