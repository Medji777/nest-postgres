import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './repository/comments.repository';
import { LikeStatus } from '../../types/types';
import { LikeInfoModel } from '../../types/likes';
import { LikeCalculateService } from '../../applications/likeCalculate.service';
import { CommentsLikeQueryRepository } from './like/repository/commentsLike.query-repository';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { CommentsLikeService } from './like/commentsLike.service';
import { LikeInputModelDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly likeCalculateService: LikeCalculateService,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsLikesService: CommentsLikeService,
    private readonly commentsLikeQueryRepository: CommentsLikeQueryRepository,
  ) {}
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
}
