import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './repository/comments.repository';
import { Comments, CommentsSchema } from './entity/comments.schema';
import { Posts, PostsSchema } from "../posts/entity/posts.schema";
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { JwtAccessStrategy } from '../auth/strategies/jwt-access.strategy';
import { CommentsLikeModule } from './like/commentsLike.module';
import { LikeCalculateService } from '../../applications/likeCalculate.service';
import { UsersModule } from '../../users/users.module';
import { PaginationService } from '../../applications/pagination.service';
import { JwtService } from '../../applications/jwt.service';
import { settings } from "../../config";
import {CommentsSqlRepository} from "./repository/commentsSql.repository";
import {CommentsSqlQueryRepository} from "./repository/commentsSql.query-repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema },
      { name: Posts.name, schema: PostsSchema }
    ]),
    JwtModule.register({
      secret: settings.JWT_SECRET
    }),
    CommentsLikeModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsSqlRepository,
    CommentsQueryRepository,
    CommentsSqlQueryRepository,
    JwtAccessStrategy,
    LikeCalculateService,
    PaginationService,
    JwtService,
  ],
  exports: [CommentsService, CommentsQueryRepository],
})
export class CommentsModule {}
