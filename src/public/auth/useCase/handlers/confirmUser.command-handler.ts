import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException} from "@nestjs/common";
import {ConfirmUserCommand} from "../commands/confirmUser.command";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserCommandHandler implements ICommandHandler<ConfirmUserCommand> {
    constructor(private usersSqlRepository: UsersSqlRepository) {}
    async execute(command: ConfirmUserCommand): Promise<void> {
        const isUpdated = await this.usersSqlRepository.updateConfirmation(command.code)
        if (!isUpdated) {
            throw new BadRequestException();
        }
    }
}