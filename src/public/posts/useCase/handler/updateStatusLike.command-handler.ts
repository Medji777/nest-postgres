import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {UpdateStatusLikeCommand} from "../command";
import {PostsSqlRepository} from "../../repository/postsSql.repository";
import {PostsLikeSqlRepository} from "../../like/repository/postsLikeSql.repository";
import {BlogsUsersBanSqlRepository} from "../../../../bloggers/users/repository/blogsUsersBanSql.repository";
import {LikeStatus} from "../../../../types/types";

@CommandHandler(UpdateStatusLikeCommand)
export class UpdateStatusLikeCommandHandler implements ICommandHandler<UpdateStatusLikeCommand> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private postsLikeSqlRepository: PostsLikeSqlRepository,
        private blogsUsersBanRepository: BlogsUsersBanSqlRepository,
    ) {}
    async execute(command: UpdateStatusLikeCommand): Promise<void> {
        const {userId, postId, bodyDTO: newStatus} = command;

        const post = await this.postsSqlRepository.findById(postId)
        if (!post) throw new NotFoundException();

        const isBanned = await this.blogsUsersBanRepository.checkBanStatusForBlog(userId,post.blogId);
        if(isBanned) throw new ForbiddenException()

        await this.updateStatus(userId,postId,newStatus.likeStatus)
        await this.updateCountLikes(postId)
    }

    private async updateStatus(userId: string, postId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInfo = await this.postsLikeSqlRepository.findByUserIdAndPostId(userId,postId)

        if (!likeInfo) {
            await this.postsLikeSqlRepository.create(
                userId,
                postId,
                likeStatus,
            )
        } else {
            await this.postsLikeSqlRepository.updateStatus(
                userId,
                postId,
                likeStatus
            )
        }
    }
    private async updateCountLikes(postId: string): Promise<void> {
        await this.postsSqlRepository.updateCountLikesInPost(postId)
    }
}