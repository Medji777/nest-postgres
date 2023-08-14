import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteCommentCommand} from "../command";
import {NotFoundException} from "@nestjs/common";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentCommandHandler implements ICommandHandler<DeleteCommentCommand> {
    constructor(
        private readonly commentsSqlRepository: CommentsSqlRepository
    ) {}

    async execute(command: DeleteCommentCommand): Promise<void> {
        const isDeleted = await this.commentsSqlRepository.delete(command.id)
        if (!isDeleted) throw new NotFoundException();
    }
}