import {CommentatorInfo} from "../comments";
import {LikesInfoViewModel} from "../likes";

export type CommentsSqlType = {
    id: string,
    content: string,
    userId: string,
    createdAt: Date,
    postId: string,
    bloggerId: string,
    likesCount: number,
    dislikesCount: number
}

export type CommentSqlModel = Pick<CommentsSqlType, 'id' | 'content' | 'createdAt'> & {
    commentatorInfo: CommentatorInfo;
    likesInfo: LikesInfoViewModel;
}