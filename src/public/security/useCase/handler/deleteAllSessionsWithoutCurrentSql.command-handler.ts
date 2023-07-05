import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteAllSessionsWithoutCurrentCommand} from "../command";
// import {SecurityRepository} from "../../repository/security.repository";
import {BadRequestException} from "@nestjs/common";
import {SecuritySqlRepository} from "../../repository/securitySql.repository";

@CommandHandler(DeleteAllSessionsWithoutCurrentCommand)
export class DeleteAllSessionsWithoutCurrentSqlCommandHandler implements ICommandHandler<DeleteAllSessionsWithoutCurrentCommand> {
    constructor(
        // private securityRepository: SecurityRepository,
        private securitySqlRepository: SecuritySqlRepository
    ) {}
    async execute(command: DeleteAllSessionsWithoutCurrentCommand): Promise<void> {
        const isDeleted = await this.securitySqlRepository.deleteAllSessionsWithoutCurrent(command.userId,command.deviceId)
        // const isDeleted = await this.securityRepository.deleteAllSessionsWithoutCurrent(
        //     command.userId,
        //     command.deviceId,
        // );
        if (!isDeleted) {
            throw new BadRequestException();
        }
    }
}