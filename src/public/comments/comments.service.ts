import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './repository/comments.repository';
import {
  CommentatorInfo,
  CommentDBModel,
  CommentInputModel,
  CommentViewModel,
  PostId,
} from '../../types/comments';
import { CommentsDocument } from './entity/comments.schema';
import { LikeStatus } from '../../types/types';
import { LikeInfoModel } from '../../types/likes';
import { LikeCalculateService } from '../../applications/likeCalculate.service';
import { CommentsLikeQueryRepository } from './like/repository/commentsLike.query-repository';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { CommentsLikeService } from './like/commentsLike.service';
import { CommentInputModelDto, LikeInputModelDto } from './dto';
import {CommentsSqlRepository} from "./repository/commentsSql.repository";
import {CommentsSqlQueryRepository} from "./repository/commentsSql.query-repository";

type CommentPayload = CommentInputModel & CommentatorInfo & PostId & {bloggerId: string};

@Injectable()
export class CommentsService {
  constructor(
    private readonly likeCalculateService: LikeCalculateService,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsLikesService: CommentsLikeService,
    private readonly commentsLikeQueryRepository: CommentsLikeQueryRepository,
  ) {}
  async create(payload: CommentPayload): Promise<CommentDBModel> {
    const data = await this.commentsSqlRepository.create(
        payload.content,
        payload.postId,
        payload.userId,
        payload.bloggerId
    )
    return this.commentsSqlQueryRepository.findById(data.id)
  }
  async update(id: string, payload: CommentInputModelDto): Promise<void> {
    const doc = await this.commentsRepository.findById(id);
    if (!doc) {
      throw new NotFoundException();
    }
    doc.update(payload);
    await this.commentsRepository.save(doc);
  }
  async delete(id: string): Promise<void> {
    const isDeleted = this.commentsRepository.delete(id);
    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
  async deleteAll(): Promise<void> {
    await this.commentsRepository.deleteAll();
  }
  async deleteAllLikes(): Promise<void> {
    await this.commentsLikesService.deleteAll();
  }
  async updateLike(commentId: string, userId: string, payload: LikeInputModelDto): Promise<void> {
    let lastStatus: LikeStatus = LikeStatus.None;
    const comment = await this.commentsQueryRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    const likeInfo = await this.commentsLikeQueryRepository.getLike(
      userId,
      commentId,
    );
    if (!likeInfo) {
      await this.commentsLikesService.create(
        userId,
        commentId,
        payload.likeStatus,
      );
    } else {
      await this.commentsLikesService.update(likeInfo, payload.likeStatus);
      lastStatus = likeInfo.myStatus;
    }
    const likeInfoCalc = this.likeCalculateService.getUpdatedLike(
      {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
      },
      lastStatus,
      payload.likeStatus,
    );
    await this.updateLikeInComment(comment.id!, likeInfoCalc);
  }

  private async updateLikeInComment(
    id: string,
    likesInfoDTO: LikeInfoModel,
  ): Promise<boolean> {
    const doc = await this.commentsRepository.findById(id);
    if (!doc) return false;
    doc.updateLikeInComment(likesInfoDTO);
    await this.commentsRepository.save(doc);
    return true;
  }

  private _mapComments(doc: CommentsDocument): CommentDBModel {
    return {
      id: doc.id,
      content: doc.content,
      commentatorInfo: doc.commentatorInfo,
      createdAt: doc.createdAt,
      likesInfo: {
        likesCount: doc.likesInfo.likesCount,
        dislikesCount: doc.likesInfo.dislikesCount,
      },
    };
  }
  private _likeCreateTransform(comment: CommentDBModel): CommentViewModel {
    return {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: LikeStatus.None,
      },
    };
  }
}
