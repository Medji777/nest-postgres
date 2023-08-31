import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from "@nestjs/cqrs";
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreateCommentByPostCommandHandler, UpdateStatusLikeCommandHandler } from "./useCase/handler";
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { JwtAccessStrategy } from '../auth/strategies/jwt-access.strategy';
import { PostsLikeModule } from './like/postsLike.module';
import { UsersModule } from '../../users/users.module';
import { JwtService } from '../../applications/jwt.service';
import { PaginationService } from '../../applications/pagination.service';
import { CheckBlogIdValidate } from "../../utils/validates";
import { PostsSqlRepository } from "./repository/postsSql.repository";
import { BlogsUsersBanSqlRepository } from "../../bloggers/users/repository/blogsUsersBanSql.repository";
import { PostsSqlQueryRepository } from "./repository/postsSql.query-repository";
import { CreateCommentCommandHandler } from "../comments/useCase/handler";
import {CommentsSqlRepository} from "../comments/repository/commentsSql.repository";

const commandHandlers = [UpdateStatusLikeCommandHandler, CreateCommentByPostCommandHandler, CreateCommentCommandHandler];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => BlogsModule),
    CommentsModule,
    PostsLikeModule,
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsSqlRepository,
    PostsSqlQueryRepository,
    BlogsUsersBanSqlRepository,
    CommentsSqlRepository,
    JwtAccessStrategy,
    JwtService,
    PaginationService,
    CheckBlogIdValidate,
    ...commandHandlers
  ],
  exports: [PostsService, PostsSqlQueryRepository],
})
export class PostsModule {}
