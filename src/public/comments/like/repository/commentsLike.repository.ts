import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentsLike,
  CommentsLikeDocument,
  CommentsLikeModelType,
} from '../entity/commentsLike.schema';
import { LikeStatus } from '../../../../types/types';

@Injectable()
export class CommentsLikeRepository {
  constructor(
    @InjectModel(CommentsLike.name)
    private CommentsLikeModel: CommentsLikeModelType,
  ) {}
  create(
    userId,
    commentId,
    myStatus: LikeStatus,
  ): CommentsLikeDocument {
    return this.CommentsLikeModel.make(
        userId,
        commentId,
        myStatus,
        this.CommentsLikeModel,
    );
  }
  async findByUserIdAndCommentId(
    userId: string,
    commentId: string,
  ): Promise<CommentsLikeDocument> {
    return this.CommentsLikeModel.findOne({ userId, commentId });
  }
  async save(model: CommentsLikeDocument): Promise<void> {
    await model.save();
  }
  async deleteAll(): Promise<void> {
    await this.CommentsLikeModel.deleteMany({});
  }
}
