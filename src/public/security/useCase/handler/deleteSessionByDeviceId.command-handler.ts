import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteSessionByDeviceIdCommand} from "../command";
import {SecurityService} from "../../security.service";

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdCommandHandler implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
    constructor(private securityService: SecurityService) {}
    async execute(command: DeleteSessionByDeviceIdCommand): Promise<void> {
        const {deviceId} = command;
        await this.securityService.deleteSessionByDeviceIdSql(deviceId,true)
    }
}