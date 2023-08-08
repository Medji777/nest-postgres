import { Injectable } from '@nestjs/common';
import { LikeInfoModel } from '../types/likes';
import { LikeStatus } from '../types/types';

@Injectable()
export class LikeCalculateService {
  getUpdatedLike(
    likesInfo: LikeInfoModel,
    lastStatus: LikeStatus,
    newStatus: LikeStatus,
  ): LikeInfoModel {
    if (newStatus === LikeStatus.None && lastStatus === LikeStatus.Like) {
      return { ...likesInfo, likesCount: --likesInfo.likesCount };
    }
    if (newStatus === LikeStatus.None && lastStatus === LikeStatus.Dislike) {
      return { ...likesInfo, dislikesCount: --likesInfo.dislikesCount };
    }
    if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.None) {
      return { ...likesInfo, likesCount: ++likesInfo.likesCount };
    }
    if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.Dislike) {
      return {
        ...likesInfo,
        likesCount: ++likesInfo.likesCount,
        dislikesCount: --likesInfo.dislikesCount,
      };
    }
    if (newStatus === LikeStatus.Dislike && lastStatus === LikeStatus.None) {
      return { ...likesInfo, dislikesCount: ++likesInfo.dislikesCount };
    }
    if (newStatus === LikeStatus.Dislike && lastStatus === LikeStatus.Like) {
      return {
        ...likesInfo,
        likesCount: --likesInfo.likesCount,
        dislikesCount: ++likesInfo.dislikesCount,
      };
    }
    return likesInfo;
  }
  updateLikesBanCount(
      statusLike: LikeStatus,
      isBanned: boolean,
      model: any
  ) {
    if (isBanned) {
      if (statusLike === LikeStatus.Like) {
        model.likesCount--;
      }
      if (statusLike === LikeStatus.Dislike) {
        model.dislikesCount--;
      }
    } else {
      if (statusLike === LikeStatus.Like) {
        model.likesCount++;
      }
      if (statusLike === LikeStatus.Dislike) {
        model.dislikesCount++;
      }
    }
  }
}
