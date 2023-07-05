import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsLikeRepository } from './repository/commentsLike.repository';
import { LikeStatus } from '../../../types/types';
import { CommentsLikeDocument } from './entity/commentsLike.schema';

type LikesInfo = {
  userId: string;
  commentId: string;
};

@Injectable()
export class CommentsLikeService {
  constructor(
    private readonly commentsLikeRepository: CommentsLikeRepository,
  ) {}
  async create(userId: string, commentId: string, myStatus: LikeStatus): Promise<CommentsLikeDocument> {
    const doc = this.commentsLikeRepository.create(
      userId,
      commentId,
      myStatus
    );
    await this.commentsLikeRepository.save(doc);
    return doc;
  }
  async update(likeInfo: LikesInfo, myStatus: LikeStatus): Promise<void> {
    const like = await this.commentsLikeRepository.findByUserIdAndCommentId(
      likeInfo.userId,
      likeInfo.commentId,
    );
    if (!like) {
      throw new NotFoundException();
    }
    like.update(myStatus);
    await this.commentsLikeRepository.save(like);
  }
  async deleteAll(): Promise<void> {
    await this.commentsLikeRepository.deleteAll();
  }
}
