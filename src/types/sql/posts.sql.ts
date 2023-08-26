import {LikesPostsExtendedViewModel} from "../likes";
import {LikeStatus} from "../types";

export type PostsSqlType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    createdAt: Date,
    postOwnerId: string,
    likesCount: number,
    dislikesCount: number
}

export type PostsSqlFilterType = PostsSqlType & {
    blogName: string,
    myStatus: LikeStatus,
    lastLikesUser: Array<LikesPostsExtendedViewModel>
}