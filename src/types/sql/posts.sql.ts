import {LikesPostsExtendedViewModel} from "../likes";

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
    likeStatus: number,
    dislikeStatus: number,
    lastLikesUser: Array<LikesPostsExtendedViewModel>
}