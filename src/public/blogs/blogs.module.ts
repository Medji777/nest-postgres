import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './repository/blogs.repository';
import { BlogsQueryRepository } from './repository/blogs.query-repository';
import { Blogs, BlogsSchema } from './entity/blogs.schema';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../../users/users.module';
import { PaginationService } from '../../applications/pagination.service';
import { JwtService } from '../../applications/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blogs.name, schema: BlogsSchema }]),
    PostsModule,
    UsersModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PaginationService,
    JwtService,
  ],
  exports: [BlogsService, BlogsQueryRepository],
})
export class BlogsModule {}
