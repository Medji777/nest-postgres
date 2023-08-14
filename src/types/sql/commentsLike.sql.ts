import {LikeStatus} from "../types";

export type CommentsLikeSql = {
    userId: string,
    commentId: string,
    myStatus: LikeStatus
}