import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateStatusLikeCommand} from "../command";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";
import {CommentsLikeSqlRepository} from "../../like/repository/commentsLikeSql.repository";
import {NotFoundException} from "@nestjs/common";
import {LikeStatus} from "../../../../types/types";

@CommandHandler(UpdateStatusLikeCommand)
export class UpdateStatusLikeCommandHandler implements ICommandHandler<UpdateStatusLikeCommand> {
    constructor(
        private commentsSqlRepository: CommentsSqlRepository,
        private commentsLikeSqlRepository: CommentsLikeSqlRepository
    ) {}

    async execute(command: UpdateStatusLikeCommand): Promise<any> {
        const {userId, commentId, bodyDTO: newStatus} = command;

        const comment = await this.commentsSqlRepository.findById(commentId)

        if (!comment) {
            throw new NotFoundException();
        }

        await Promise.all([
            this.updateStatus(userId,commentId,newStatus.likeStatus),
            this.updateCountLikes(userId,commentId)
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
                commentId,
                likeStatus
            )
        }
    }
    private async updateCountLikes(userId: string, commentId: string): Promise<void> {
        await this.commentsSqlRepository.updateCountLikesByComment(commentId, userId)
    }
}