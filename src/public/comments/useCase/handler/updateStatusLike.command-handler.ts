import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateStatusLikeCommand} from "../command";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";
import {CommentsLikeSqlRepository} from "../../like/repository/commentsLikeSql.repository";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {LikeStatus} from "../../../../types/types";
import {BlogsUsersBanSqlRepository} from "../../../../bloggers/users/repository/blogsUsersBanSql.repository";

@CommandHandler(UpdateStatusLikeCommand)
export class UpdateStatusLikeCommandHandler implements ICommandHandler<UpdateStatusLikeCommand> {
    constructor(
        private commentsSqlRepository: CommentsSqlRepository,
        private commentsLikeSqlRepository: CommentsLikeSqlRepository,
        private blogsUsersBanRepository: BlogsUsersBanSqlRepository,
    ) {}

    async execute(command: UpdateStatusLikeCommand): Promise<any> {
        const {userId, commentId, bodyDTO: newStatus} = command;

        const comment = await this.commentsSqlRepository.findById(commentId)

        if (!comment) {
            throw new NotFoundException();
        }

        const isBanned = await this.blogsUsersBanRepository.checkBannedUserByPostId(userId,comment.postId);
        if(isBanned) throw new ForbiddenException()

        await Promise.all([
            this.updateStatus(userId,commentId,newStatus.likeStatus),
            this.updateCountLikes(commentId)
        ])
    }

    private async updateStatus(userId: string, commentId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInfo = await this.commentsLikeSqlRepository.findByUserIdAndCommentId(userId, commentId);

        if(!likeInfo){
           await this.commentsLikeSqlRepository.create(
               userId,
               commentId,
               likeStatus
           )
        } else {
            await this.commentsLikeSqlRepository.updateStatus(
                userId,
                commentId,
                likeStatus
            )
        }
    }
    private async updateCountLikes(commentId: string): Promise<void> {
        await this.commentsSqlRepository.updateCountLikesByComment(commentId)
    }
}