import { LikeStatus } from './types';

export type LikeInputModel = {
  likeStatus: LikeStatus;
};

export type MyStatus = {
  myStatus: LikeStatus;
};

export type LikeInfoModel = {
  likesCount: number;
  dislikesCount: number;
};

export type LikesInfoViewModel = LikeInfoModel & MyStatus;

export type LikesCommentModel = {
  userId: string;
  commentId: string;
} & MyStatus;

export class LikesCommentModelDTO {
  constructor(
    public userId: string,
    public commentId: string,
    public myStatus: LikeStatus,
  ) {}
}

export type LikesPostsModel = {
  userId: string;
  postId: string;
  login: string;
  addedAt: string;
} & MyStatus;

export class LikesPostsModelDTO {
  constructor(
    public userId: string,
    public postId: string,
    public login: string,
    public addedAt: string,
    public myStatus: LikeStatus,
  ) {}
}

export type LikesPostsExtendedViewModel = {
  addedAt: string;
  userId: string;
  login: string;
};

export type UpdateLikeBan<M> = (statusLike: LikeStatus, isBanned: boolean, model: M) => void