import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from "@nestjs/cqrs";
import { Posts, PostsSchema } from './entity/posts.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './repository/posts.repository';
import { PostsQueryRepository } from './repository/posts.query-repository';
import { CreateCommentByPostCommandHandler, UpdateStatusLikeCommandHandler } from "./useCase/handler";
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { JwtAccessStrategy } from '../auth/strategies/jwt-access.strategy';
import { PostsLikeModule } from './like/postsLike.module';
import { LikeCalculateService } from '../../applications/likeCalculate.service';
import { UsersModule } from '../../users/users.module';
import { JwtService } from '../../applications/jwt.service';
import { PaginationService } from '../../applications/pagination.service';
import { CheckBlogIdValidate } from "../../utils/validates";

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{name: Posts.name, schema: PostsSchema}]),
    forwardRef(() => BlogsModule),
    CommentsModule,
    PostsLikeModule,
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    JwtAccessStrategy,
    LikeCalculateService,
    JwtService,
    PaginationService,
    CheckBlogIdValidate,
    UpdateStatusLikeCommandHandler,
    CreateCommentByPostCommandHandler
  ],
  exports: [PostsService, PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
