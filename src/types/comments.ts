import { LikeInfoModel, LikesInfoViewModel } from './likes';
import { QueryPosts } from './posts';

export type CommentInputModel = {
  content: string;
};

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
};

export type PostInfo = {
  id: string,
  title: string,
  blogId: string,
  blogName: string
}

export type CommentViewType = CommentViewModel & {postInfo: PostInfo}

export type CommentDBModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikeInfoModel;
};

export type PostId = {
  postId: string;
};

export type QueryComments = QueryPosts;

export type CommentModel = CommentDBModel & PostId;
