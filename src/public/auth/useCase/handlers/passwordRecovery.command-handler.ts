import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PasswordRecoveryCommand} from "../commands";
import {BadRequestException} from "@nestjs/common";
import {ActiveCodeAdapter} from "../../../../adapters/activeCode.adapter";
//import {UsersService} from "../../../../users/users.service";
import {EmailAdapter} from "../../../../adapters/email.adapter";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryCommandHandler implements ICommandHandler<PasswordRecoveryCommand> {
    constructor(
        private activeCodeAdapter: ActiveCodeAdapter,
        private emailAdapter: EmailAdapter,
        //private readonly usersService: UsersService,
        private usersSqlRepository: UsersSqlRepository
    ) {}
    async execute(command: PasswordRecoveryCommand): Promise<void> {
        const {email} = command;

        const passwordConfirmation = this.activeCodeAdapter.createCode();
        const isUpdated = await this.usersSqlRepository.updatePasswordConfirmationData(
            passwordConfirmation,
            email
        )
        if (!isUpdated) {
            throw new BadRequestException();
        }
        // await this.usersService.updatePasswordConfirmationData(
        //     email,
        //     passwordConfirmation,
        // );
        try {
            await this.emailAdapter.sendRecoveryCodeConfirmationMessage(
                email,
                passwordConfirmation.confirmationCode,
                'password-recovery',
            );
        } catch (err) {
            console.log(err);
            throw new BadRequestException();
        }
    }
}