import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentsLike,
  CommentsLikeDocument,
  CommentsLikeModelType,
} from '../entity/commentsLike.schema';
import { LikesCommentModel } from '../../../../types/likes';

@Injectable()
export class CommentsLikeQueryRepository {
  constructor(
    @InjectModel(CommentsLike.name)
    private CommentsLikeModel: CommentsLikeModelType,
  ) {}
  async getLike(
    userId: string,
    commentId: string,
  ): Promise<LikesCommentModel | null> {
    const result = await this.CommentsLikeModel.findOne({ userId, commentId });
    if (!result) return null;
    return this._getOutputLike(result);
  }
  private _getOutputLike(like: CommentsLikeDocument): LikesCommentModel {
    return {
      userId: like.userId,
      commentId: like.commentId,
      myStatus: like.myStatus,
    };
  }
}
