import { Injectable } from '@nestjs/common';
import { PostsRepository } from './repository/posts.repository';
import {
  BlogName,
  PostInputModel,
  PostsDBModel,
  PostsViewModel,
} from '../../types/posts';
import { PostsDocument } from './entity/posts.schema';
import { LikeStatus } from '../../types/types';
import { PostsLikeService } from './like/postsLike.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsLikeService: PostsLikeService,
  ) {}
  async create(payload: PostInputModel & BlogName & {userId: string}): Promise<PostsViewModel> {
    const createPost = this.postsRepository.create(
        payload.title,
        payload.shortDescription,
        payload.content,
        payload.blogId,
        payload.blogName,
        payload.userId
    );
    await this.postsRepository.save(createPost);
    return this._likeCreateTransform(this._mappedPostModel(createPost));
  }
  async deleteAll(): Promise<void> {
    await this.postsRepository.deleteAll();
  }
  async deleteAllLikes(): Promise<void> {
    await this.postsLikeService.deleteAll();
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
  private _mappedPostModel(model: PostsDocument): PostsDBModel {
    return {
      id: model.id,
      title: model.title,
      shortDescription: model.shortDescription,
      content: model.content,
      blogId: model.blogId,
      blogName: model.blogName,
      createdAt: model.createdAt,
      extendedLikesInfo: model.extendedLikesInfo,
    };
  }
}
