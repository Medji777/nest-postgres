import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from "@nestjs/cqrs";
import { CommentsController } from './comments.controller';
import { JwtAccessStrategy } from '../auth/strategies/jwt-access.strategy';
import { CommentsLikeModule } from './like/commentsLike.module';
import { LikeCalculateService } from '../../applications/likeCalculate.service';
import { UsersModule } from '../../users/users.module';
import { PaginationService } from '../../applications/pagination.service';
import { JwtService } from '../../applications/jwt.service';
import { settings } from "../../config";
import { CommentsSqlRepository } from "./repository/commentsSql.repository";
import { CommentsSqlQueryRepository } from "./repository/commentsSql.query-repository";
import {
  UpdateContentCommandHandler,
  DeleteCommentCommandHandler,
  UpdateStatusLikeCommandHandler
} from "./useCase/handler";
import { CommentsLikeSqlRepository } from "./like/repository/commentsLikeSql.repository";
import {BlogsUsersBanSqlRepository} from "../../bloggers/users/repository/blogsUsersBanSql.repository";

const CommandHandlers = [UpdateContentCommandHandler, DeleteCommentCommandHandler, UpdateStatusLikeCommandHandler];
const Repositories = [CommentsSqlRepository,CommentsSqlQueryRepository,CommentsLikeSqlRepository,BlogsUsersBanSqlRepository];
const Strategy = [JwtAccessStrategy];
const Services = [LikeCalculateService,PaginationService,JwtService]

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: settings.JWT_SECRET
    }),
    CommentsLikeModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [
    ...Repositories,
    ...Strategy,
    ...Services,
    ...CommandHandlers
  ],
  exports: [CommentsSqlQueryRepository],
})
export class CommentsModule {}
