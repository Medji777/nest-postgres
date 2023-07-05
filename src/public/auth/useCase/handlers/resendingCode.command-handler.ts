import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException} from "@nestjs/common";
import {ResendingCodeCommand} from "../commands";
import {ActiveCodeAdapter} from "../../../../adapters/activeCode.adapter";
import {EmailAdapter} from "../../../../adapters/email.adapter";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";

@CommandHandler(ResendingCodeCommand)
export class ResendingCodeCommandHandler implements ICommandHandler<ResendingCodeCommand> {
    constructor(
        private activeCodeAdapter: ActiveCodeAdapter,
        private usersSqlRepository: UsersSqlRepository,
        private emailAdapter: EmailAdapter,
    ) {}
    async execute(command: ResendingCodeCommand): Promise<void> {
        const {bodyDTO} = command;
        const emailConfirmation = this.activeCodeAdapter.createCode();

        const isUpdated = await this.usersSqlRepository.updateConfirmationData(emailConfirmation, bodyDTO.email);
        if (!isUpdated) {
            throw new BadRequestException();
        }

        try {
            await this.emailAdapter.sendCodeConfirmationMessage(
                bodyDTO.email,
                emailConfirmation.confirmationCode,
                'confirm-registration',
            );
        } catch (err) {
            console.log(err);
            throw new BadRequestException()
        }
    }
}