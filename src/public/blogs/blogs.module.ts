import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../../users/users.module';
import { PaginationService } from '../../applications/pagination.service';
import { JwtService } from '../../applications/jwt.service';
import { BlogsSqlQueryRepository } from "./repository/blogsSql.query-repository";
import { BlogsSqlRepository } from "./repository/blogsSql.repository";

@Module({
  imports: [
    PostsModule,
    UsersModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PaginationService,
    JwtService,
  ],
  exports: [BlogsService],
})
export class BlogsModule {}
