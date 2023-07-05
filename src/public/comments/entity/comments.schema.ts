import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CommentInputModel } from '../../../types/comments';
import {LikeInfoModel, UpdateLikeBan} from '../../../types/likes';
import {LikeStatus} from "../../../types/types";

export type CommentsDocument = HydratedDocument<Comments>;
export type CommentsModuleType = Model<CommentsDocument> &
  CommentsStaticMethods;
export type CommentsStaticMethods = {
  make: (
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
    bloggerId: string,
    CommentsModel: CommentsModuleType,
  ) => CommentsDocument;
};

@Schema({_id: false})
class CommentatorInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ default: false })
  isBanned: boolean;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo)

@Schema({_id: false})
class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;
  @Prop({ default: 0 })
  dislikesCount: number;
}

const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo)

@Schema()
export class Comments {
  @Prop()
  id: string;
  @Prop({ required: true })
  content: string;
  @Prop({ type: CommentatorInfoSchema, default: () => ({}) })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  bloggerId: string;
  @Prop({ type: LikesInfoSchema, default: () => ({}) })
  likesInfo: LikesInfo;

  update(payload: CommentInputModel) {
    this.content = payload.content;
  }

  updateLikeInComment(payload: LikeInfoModel) {
    this.likesInfo = payload;
  }
  updateBan(isBanned: boolean) {
    this.commentatorInfo.isBanned = isBanned
  }

  updateLikesCount(
      statusLike: LikeStatus,
      isBanned: boolean,
      update: UpdateLikeBan<LikesInfo>
  ) {
    update(statusLike,isBanned,this.likesInfo)
  }

  static make(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
    bloggerId: string,
    CommentsModel: CommentsModuleType,
  ): CommentsDocument {
    const date = new Date();
    const newComment = {
      id: `${+date}`,
      content: content,
      postId: postId,
      bloggerId: bloggerId,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: date.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    };
    return new CommentsModel(newComment);
  }
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);

CommentsSchema.methods = {
  update: Comments.prototype.update,
  updateLikeInComment: Comments.prototype.updateLikeInComment,
  updateBan: Comments.prototype.updateBan,
  updateLikesCount: Comments.prototype.updateLikesCount
};

const staticMethods: CommentsStaticMethods = {
  make: Comments.make,
};

CommentsSchema.statics = staticMethods;
