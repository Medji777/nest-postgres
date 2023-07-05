import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdatePasswordCommand} from "../commands/updatePassword.command";
import {PassHashService} from "../../../../applications/passHash.service";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";
import {BadRequestException} from "@nestjs/common";

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordCommandHandler implements ICommandHandler<UpdatePasswordCommand> {
    constructor(
        private readonly passHashService: PassHashService,
        private readonly usersSqlRepository: UsersSqlRepository
    ) {}
    async execute(command: UpdatePasswordCommand): Promise<any> {
        const passwordHash = await this.passHashService.create(command.newPassword);
        const isUpdated = await this.usersSqlRepository.updatePassword(
            {passwordHash},
            command.recoveryCode
        )
        if (!isUpdated) {
            throw new BadRequestException();
        }
    }
}