import { HydratedDocument } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsLike, PostsLikeModelType } from '../entity/postsLike.schema';
import { LikeStatus } from '../../../../types/types';
import { LikesPostsExtendedViewModel, LikesPostsModel } from '../../../../types/likes';

@Injectable()
export class PostsLikeQueryRepository {
  constructor(
    @InjectModel(PostsLike.name) private PostsLikeModel: PostsLikeModelType,
  ) {}
  async getLastThreeLikes(postId: string): Promise<LikesPostsExtendedViewModel[]> {
    const desc = -1;
    const threeLastUser = 3;
    const result = await this.PostsLikeModel.find({ postId: postId, myStatus: LikeStatus.Like, isBanned: false })
      .sort({ addedAt: desc })
      .limit(threeLastUser);

    if (!result) return [];
    return result.map(this._getOutputExtendedLike);
  }
  async getLike(userId: string, postId: string): Promise<LikesPostsModel | null> {
    const result = await this.PostsLikeModel.findOne({ userId, postId, isBanned: false });
    if (!result) return null;
    return this._getOutputLike(result);
  }
  private _getOutputLike(like: HydratedDocument<LikesPostsModel>): LikesPostsModel {
    return {
      userId: like.userId,
      postId: like.postId,
      myStatus: like.myStatus,
      login: like.login,
      addedAt: like.addedAt,
    };
  }
  private _getOutputExtendedLike(like: LikesPostsModel): LikesPostsExtendedViewModel {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    };
  }
}
