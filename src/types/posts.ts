import { LikeStatus, SortDirections } from './types';
import { LikesPostsExtendedViewModel } from './likes';

export type PostsViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt?: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<LikesPostsExtendedViewModel>;
  };
};

export type PostsDBModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt?: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type BlogName = {
  blogName: string;
};

export type QueryPosts = {
  sortBy: string;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};
