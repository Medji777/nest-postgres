import {LikeStatus} from "../types";

export type PostsLikeSql = {
    userId: string,
    postId: string,
    myStatus: LikeStatus,
    addedAt: Date,
    isBanned: boolean
}