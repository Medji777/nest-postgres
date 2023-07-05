import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Comments, CommentsModuleType} from "../../../public/comments/entity/comments.schema";
import {
    CommentsLike,
    CommentsLikeDocument,
    CommentsLikeModelType
} from "../../../public/comments/like/entity/commentsLike.schema";
import {PostsLike, PostsLikeDocument, PostsLikeModelType} from "../../../public/posts/like/entity/postsLike.schema";

@Injectable()
export class CommandRepository {
    constructor(
        @InjectModel(Comments.name) private CommentsModel: CommentsModuleType,
        @InjectModel(CommentsLike.name) private CommentsLikeModel: CommentsLikeModelType,
        @InjectModel(PostsLike.name) private PostsLikeModel: PostsLikeModelType,
    ) {}
    async findLikeCommentsByUserId(userId: string): Promise<Array<CommentsLikeDocument>> {
        return this.CommentsLikeModel.find({userId})
    }
    async findLikePostsByUserId(userId: string): Promise<Array<PostsLikeDocument>> {
        return this.PostsLikeModel.find({userId})
    }
    async updateAllBanInfoUserAtComments(userId: string, isBanned: boolean) {
        await this.CommentsModel.updateMany(
            {"commentatorInfo.userId": userId},
            {$set: {"commentatorInfo.isBanned": isBanned}}
        )
    }
    async updateAllBanInfoUserAtCommentsLike(userId: string, isBanned: boolean) {
        await this.CommentsLikeModel.updateMany({userId},{$set: {isBanned}})
    }
    async updateAllBanInfoUserAtPostsLike(userId: string, isBanned: boolean) {
        await this.PostsLikeModel.updateMany({userId},{$set: {isBanned}})
    }
}