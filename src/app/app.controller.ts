import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
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
    await this.dataSource.query(`TRUNCATE "Users" CASCADE`);
    await this.dataSource.query(`TRUNCATE "UsersBlogsBan" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Security" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Posts" CASCADE`);
    await this.dataSource.query(`TRUNCATE "PostsLike" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Blogs" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Comments" CASCADE`);
    await this.dataSource.query(`TRUNCATE "CommentsLike" CASCADE`);
  }
}
