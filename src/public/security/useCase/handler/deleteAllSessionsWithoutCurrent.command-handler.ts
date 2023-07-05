import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteAllSessionsWithoutCurrentCommand} from "../command";
import {SecurityRepository} from "../../repository/security.repository";
import {BadRequestException} from "@nestjs/common";

@CommandHandler(DeleteAllSessionsWithoutCurrentCommand)
export class DeleteAllSessionsWithoutCurrentCommandHandler implements ICommandHandler<DeleteAllSessionsWithoutCurrentCommand> {
    constructor(
        private securityRepository: SecurityRepository,
    ) {}
    async execute(command: DeleteAllSessionsWithoutCurrentCommand): Promise<void> {
        const isDeleted = await this.securityRepository.deleteAllSessionsWithoutCurrent(
            command.userId,
            command.deviceId,
        );
        if (!isDeleted) {
            throw new BadRequestException();
        }
    }
}