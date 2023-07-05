import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {BanUserCommand} from "../command";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";
import {SecuritySqlRepository} from "../../../../public/security/repository/securitySql.repository";

@CommandHandler(BanUserCommand)
export class BanUserSqlCommandHandler implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private securitySqlRepository: SecuritySqlRepository
    ) {}

    async execute(command: BanUserCommand): Promise<void> {
        const {userId, bodyDTO} = command;
        const res = await this.usersSqlRepository.updateBan(bodyDTO, userId)
        if(!res) throw new NotFoundException()
        await this.securitySqlRepository.deleteAllByUserId(userId)
    }
}