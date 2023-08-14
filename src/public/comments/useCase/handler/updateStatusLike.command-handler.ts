import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateStatusLikeCommand} from "../command";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";
import {CommentsLikeSqlRepository} from "../../like/repository/commentsLikeSql.repository";
import {NotFoundException} from "@nestjs/common";

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


    }
}