import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateUserCommand} from "../command";
import {PassHashService} from "../../../../applications/passHash.service";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";
import {UsersSqlType} from "../../../../types/sql/user.sql";

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly passHashService: PassHashService,
        private readonly usersSqlRepository: UsersSqlRepository
    ) {}
    async execute(command: CreateUserCommand): Promise<UsersSqlType> {
        const { bodyDTO } = command;
        const passwordHash = await this.passHashService.create(bodyDTO.password);
        return this.usersSqlRepository.create(
            bodyDTO.login,
            bodyDTO.email,
            passwordHash,
            command.dto
        )
    }
}