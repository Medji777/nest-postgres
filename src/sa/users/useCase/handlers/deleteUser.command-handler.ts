import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {DeleteUserCommand} from "../command";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(private usersSqlRepository: UsersSqlRepository) {}
    async execute(command: DeleteUserCommand): Promise<void> {
        const isDeleted = await this.usersSqlRepository.deleteById(command.id);
        if (!isDeleted) {
            throw new NotFoundException('user not found');
        }
    }
}