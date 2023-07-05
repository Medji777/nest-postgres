import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostsLike,
  PostsLikeDocument,
  PostsLikeModelType,
} from '../entity/postsLike.schema';
import { LikeStatus } from '../../../../types/types';

@Injectable()
export class PostsLikeRepository {
  constructor(
    @InjectModel(PostsLike.name) private PostsLikeModel: PostsLikeModelType,
  ) {}
  create(
    userId: string,
    postId: string,
    login: string,
    likeStatus: LikeStatus,
  ): PostsLikeDocument {
    return this.PostsLikeModel.make(
      userId,
      postId,
      login,
      likeStatus,
      this.PostsLikeModel,
    );
  }
  async findByUserIdAndPostId(
    userId: string,
    postId: string,
  ): Promise<PostsLikeDocument | null> {
    return this.PostsLikeModel.findOne({ userId, postId });
  }
  async save(model: PostsLikeDocument): Promise<void> {
    await model.save();
  }
  async deleteAll(): Promise<void> {
    await this.PostsLikeModel.deleteMany({});
  }
}
