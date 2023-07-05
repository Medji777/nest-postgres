import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException} from "@nestjs/common";
import {DeleteSessionByDeviceIdCommand} from "../commands";
import {SecurityService} from "../../../security/security.service";

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdCommandHandler implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
    constructor(private securityService: SecurityService) {}
    async execute(command: DeleteSessionByDeviceIdCommand): Promise<void> {
        const {deviceId} = command;
        const isDeleted = await this.securityService.deleteSessionByDeviceIdSql(deviceId);
        if (!isDeleted) {
            throw new BadRequestException();
        }
    }
}