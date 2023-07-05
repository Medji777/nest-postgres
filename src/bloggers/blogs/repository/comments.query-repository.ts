import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {PaginationDto} from "../../../utils/dto/pagination.dto";
import {PaginationService} from "../../../applications/pagination.service";
import {Comments, CommentsModuleType} from "../../../public/comments/entity/comments.schema";
import {Posts, PostsModelType} from "../../../public/posts/entity/posts.schema";
import {BloggerCommentViewModel} from "../../../types/comments";
import {LikeStatus} from "../../../types/types";

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comments.name) private CommentsModel: CommentsModuleType,
        @InjectModel(Posts.name) private PostsModel: PostsModelType,
        private paginationService: PaginationService
    ) {}

    async getAllCommentsWithPostByBlog(query: PaginationDto, userId: string) {
        const filter = {
            bloggerId: userId,
            "commentatorInfo.isBanned": false
        }

        const aggregatePayload = [
            {
                $match: {
                    $and: [filter]
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'postId',
                    foreignField: 'id',
                    as: 'allPostComments'
                }
            },
            {
                $unwind: '$allPostComments',
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    content: 1,
                    commentatorInfo: {
                        userId: 1,
                        userLogin: 1
                    },
                    createdAt: 1,
                    likesInfo: {
                        likesCount: 1,
                        dislikesCount: 1,
                        myStatus: LikeStatus.None
                    },
                    postInfo: {
                        id: '$allPostComments.id',
                        title: '$allPostComments.title',
                        blogId: '$allPostComments.blogId',
                        blogName: '$allPostComments.blogName'
                    }
                }
            }
        ]

        const pagination = await this.paginationService.createAggregate<CommentsModuleType,Array<BloggerCommentViewModel>>(
            query,
            this.CommentsModel,
            filter,
            aggregatePayload
        )
        return this.paginationService.transformPagination(pagination)
    }
}