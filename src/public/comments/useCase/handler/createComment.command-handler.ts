import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateCommentCommand} from "../command";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";
import {CommentsSqlQueryRepository} from "../../repository/commentsSql.query-repository";
import {CommentDBModel} from "../../../../types/comments";

@CommandHandler(CreateCommentCommand)
export class CreateCommentCommandHandler implements ICommandHandler<CreateCommentCommand> {
    constructor(
        private readonly commentsSqlRepository: CommentsSqlRepository,
        private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository
    ) {}

    async execute(command: CreateCommentCommand): Promise<CommentDBModel> {
        const data = await this.commentsSqlRepository.create(
            command.content,
            command.postId,
            command.userId,
            command.bloggerId
        )
        return this.commentsSqlQueryRepository.findById(data.id)
    }
}