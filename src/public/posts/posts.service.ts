import { Injectable } from '@nestjs/common';
import {
  BlogName,
  PostInputModel,
  PostsDBModel,
  PostsViewModel,
} from '../../types/posts';
import { LikeStatus } from '../../types/types';
import { PostsSqlRepository } from "./repository/postsSql.repository";
import { PostsSqlType } from "../../types/sql/posts.sql";

@Injectable()
export class PostsService {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}
  async create(payload: PostInputModel & BlogName & {userId: string}): Promise<PostsViewModel> {
    const createPost = await this.postsSqlRepository.create(
        payload.title,
        payload.shortDescription,
        payload.content,
        payload.blogId,
        payload.userId
    )
    return this._likeCreateTransform(this._mappedPostModel({...createPost, blogName: payload.blogName}));
  }
  async deleteAll(): Promise<void> {
    await this.postsSqlRepository.deleteAll();
  }
  private _likeCreateTransform(post: PostsDBModel): PostsViewModel {
    return {
      ...post,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
  private _mappedPostModel(model: PostsSqlType & BlogName): PostsDBModel {
    return {
      id: model.id,
      title: model.title,
      shortDescription: model.shortDescription,
      content: model.content,
      blogId: model.blogId,
      blogName: model.blogName,
      createdAt: model.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: +model.likesCount,
        dislikesCount: +model.dislikesCount
      }
    };
  }
}
