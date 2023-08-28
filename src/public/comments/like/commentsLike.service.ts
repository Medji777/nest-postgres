import {Injectable, NotFoundException} from '@nestjs/common';
import {LikeStatus} from '../../../types/types';
import {CommentsLikeSqlRepository} from "./repository/commentsLikeSql.repository";
import {CommentsLikeSql} from "../../../types/sql/commentsLike.sql";

type LikesInfo = {
  userId: string;
  commentId: string;
};

@Injectable()
export class CommentsLikeService {
  constructor(
    private readonly commentsLikeSqlRepository: CommentsLikeSqlRepository
  ) {}
  async create(userId: string, commentId: string, myStatus: LikeStatus): Promise<CommentsLikeSql> {
    return this.commentsLikeSqlRepository.create(
        userId,
        commentId,
        myStatus
    );
  }
  async update(likeInfo: LikesInfo, myStatus: LikeStatus): Promise<void> {
    const like = await this.commentsLikeSqlRepository.findByUserIdAndCommentId(
      likeInfo.userId,
      likeInfo.commentId,
    );
    if (!like) {
      throw new NotFoundException();
    }
    await this.commentsLikeSqlRepository.updateStatus(like.userId, like.commentId, myStatus)
  }
}
