import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
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
    @InjectDataSource() private readonly dataSource: DataSource
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
    await this.dataSource.query(`TRUNCATE "Users" CASCADE`);
    await this.dataSource.query(`TRUNCATE "UsersBlogsBan" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Security" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Posts" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Blogs" CASCADE`);
  }
}
