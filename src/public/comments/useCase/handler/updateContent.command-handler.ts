import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateContentCommand} from "../command";
import {CommentsSqlRepository} from "../../repository/commentsSql.repository";
import {NotFoundException} from "@nestjs/common";

@CommandHandler(UpdateContentCommand)
export class UpdateContentCommandHandler implements ICommandHandler<UpdateContentCommand> {
    constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

    async execute(command: UpdateContentCommand): Promise<void> {
        const {id, content} = command;

        const doc = await this.commentsSqlRepository.findById(id);
        if (!doc) {
            throw new NotFoundException();
        }
        await this.commentsSqlRepository.update(doc.id, content)
    }
}