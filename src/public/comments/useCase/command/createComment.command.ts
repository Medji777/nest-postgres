import {CommentatorInfo, CommentInputModel, PostId} from "../../../../types/comments";

type CommentPayload = CommentInputModel & CommentatorInfo & PostId & {bloggerId: string};

export class CreateCommentCommand {
    public content
    public postId
    public userId
    public bloggerId
    constructor(public payload: CommentPayload) {
        this.content = payload.content;
        this.postId = payload.postId;
        this.userId = payload.userId;
        this.bloggerId = payload.bloggerId;
    }
}