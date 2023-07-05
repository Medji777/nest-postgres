import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument, PostsModelType } from '../entity/posts.schema';
import { PostsViewModel } from '../../../types/posts';
import { LikeStatus, Paginator } from '../../../types/types';
import { transformPagination } from '../../../utils/transform';
import { QueryPostsDto } from '../dto';
import { PostsLikeQueryRepository } from '../like/repository/postsLike.query-repository';
import { PaginationService } from '../../../applications/pagination.service';

const projectionInit = { _id: 0, __v: 0 };

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Posts.name) private PostsModel: PostsModelType,
    private readonly postsLikeQueryRepository: PostsLikeQueryRepository,
    private readonly paginationService: PaginationService,
  ) {}
  async getAll(query: QueryPostsDto, userId: string): Promise<Paginator<PostsViewModel>> {
    const filter = {
      'postOwnerInfo.isBanned': false,
      'blogIsBanned': false
    }
    const pagination = await this.paginationService.create(
        query,
        this.PostsModel,
        projectionInit,
        filter
    );

    const mappedPost = pagination.doc.map(this._getOutputPost);
    const mappedPostWithStatusLike = await this._setStatusLikeMapped(
      mappedPost,
      userId,
    );
    const mappedFinishPost = await this._setThreeLastUserMapped(
      mappedPostWithStatusLike,
    );

    return transformPagination<PostsViewModel>(
      mappedFinishPost,
      pagination.pageSize,
      pagination.pageNumber,
      pagination.count,
    );
  }
  async findById(id: string, userId: string): Promise<PostsViewModel> {
    const doc = await this.PostsModel.findOne({ id }, projectionInit);
    if (!doc) {
      throw new NotFoundException('post not found');
    }
    if(doc.checkIsBan()) {
      throw new NotFoundException('post not found');
    }
    const mappedResult = this._getOutputPost(doc);
    if (userId && mappedResult) {
      await this._setLike(userId, mappedResult);
    }
    if (mappedResult) {
      await this._setLastLike(mappedResult);
    }
    return mappedResult;
  }
  async getPostsByBlogId(
    id: string,
    query: QueryPostsDto,
    userId?: string,
  ): Promise<Paginator<PostsViewModel>> {
    const filter = {
      blogId: id,
      'postOwnerInfo.isBanned': false,
      'blogIsBanned': false
    };
    const pagination = await this.paginationService.create(
      query,
      this.PostsModel,
      projectionInit,
      filter,
    );

    const mappedPost = pagination.doc.map(this._getOutputPost);
    const mappedPostWithStatusLike = await this._setStatusLikeMapped(
      mappedPost,
      userId,
    );
    const mappedFinishPost = await this._setThreeLastUserMapped(
      mappedPostWithStatusLike,
    );

    return transformPagination<PostsViewModel>(
      mappedFinishPost,
      pagination.pageSize,
      pagination.pageNumber,
      pagination.count,
    );
  }
  private _getOutputPost(post: PostsDocument): PostsViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
  private async _setStatusLikeMapped(posts: Array<PostsViewModel>, userId?: string): Promise<Array<PostsViewModel>> {
    if (!userId) return posts;
    await Promise.all(
      posts.map(async (post: PostsViewModel) => {
        await this._setLike(userId, post);
      }),
    );
    return posts;
  }
  private async _setThreeLastUserMapped(posts: Array<PostsViewModel>): Promise<Array<PostsViewModel>> {
    await Promise.all(
      posts.map(async (post: PostsViewModel) => {
        await this._setLastLike(post);
      }),
    );
    return posts;
  }
  private async _setLike(userId: string, model: PostsViewModel): Promise<void> {
    const like = await this.postsLikeQueryRepository.getLike(userId, model.id);
    if (like) {
      model.extendedLikesInfo.myStatus = like.myStatus;
    }
  }
  private async _setLastLike(model: PostsViewModel): Promise<void> {
    const lastThreeLikes = await this.postsLikeQueryRepository.getLastThreeLikes(model.id);
    if (lastThreeLikes) {
      model.extendedLikesInfo.newestLikes = lastThreeLikes;
    }
  }
}
