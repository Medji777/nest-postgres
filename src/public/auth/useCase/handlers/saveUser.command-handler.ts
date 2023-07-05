import {CommandBus, CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {SaveUserCommand} from "../commands";
import {ActiveCodeAdapter} from "../../../../adapters/activeCode.adapter";
import {EmailAdapter} from "../../../../adapters/email.adapter";
import {CreateUserCommand, DeleteUserCommand} from "../../../../sa/users/useCase/command";
import {UsersSqlType} from "../../../../types/sql/user.sql";

@CommandHandler(SaveUserCommand)
export class SaveUserCommandHandler implements ICommandHandler<SaveUserCommand> {
    constructor(
        private readonly activeCodeAdapter: ActiveCodeAdapter,
        private readonly emailAdapter: EmailAdapter,
        private readonly commandBus: CommandBus
    ) {}
    async execute(command: SaveUserCommand): Promise<void> {
        const emailConfirmation = this.activeCodeAdapter.createCode();
        const newUser: UsersSqlType = await this.commandBus.execute(
            new CreateUserCommand(command.bodyDTO, {
                emailConfirmation,
            })
        )
        try {
            await this.emailAdapter.sendCodeConfirmationMessage(
                newUser.email,
                newUser.emailConfirmationCode,
                'confirm-email',
            );
        } catch (err) {
            console.log(err);
            await this.commandBus.execute(new DeleteUserCommand(newUser.id))
            //await this.usersService.deleteUser(newUser.id);
        }
    }
}