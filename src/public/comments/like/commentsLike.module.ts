import { Module } from '@nestjs/common';
import { CommentsLikeService } from './commentsLike.service';
import { CommentsLikeSqlRepository } from "./repository/commentsLikeSql.repository";
import { CommentsLikeSqlQueryRepository } from "./repository/commentsLikeSql.query-repository";

@Module({
  imports: [],
  providers: [
    CommentsLikeService,
    CommentsLikeSqlRepository,
    CommentsLikeSqlQueryRepository
  ],
  exports: [CommentsLikeService],
})
export class CommentsLikeModule {}
