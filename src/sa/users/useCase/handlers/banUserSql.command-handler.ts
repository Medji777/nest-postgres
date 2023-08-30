import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {BanUserCommand} from "../command";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";
import {SecuritySqlRepository} from "../../../../public/security/repository/securitySql.repository";
import {PostsSqlRepository} from "../../../../public/posts/repository/postsSql.repository";
import {CommentsSqlRepository} from "../../../../public/comments/repository/commentsSql.repository";
import {BanInputDto} from "../../dto";

@CommandHandler(BanUserCommand)
export class BanUserSqlCommandHandler implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private securitySqlRepository: SecuritySqlRepository,
        private postsSqlRepository: PostsSqlRepository,
        private commentsSqlRepository: CommentsSqlRepository
    ) {}

    async execute(command: BanUserCommand): Promise<void> {
        const {userId, bodyDTO} = command;
        await Promise.all([
            this.ban(userId, bodyDTO),
            this.updateLikesCountPosts(),
            this.updateLikesCountComments()
        ])
    }

    private async ban(userId: string, bodyDTO: BanInputDto): Promise<void> {
        const isUpdated = await this.usersSqlRepository.updateBan(bodyDTO, userId)
        if(!isUpdated) throw new NotFoundException()
        await this.securitySqlRepository.deleteAllByUserId(userId)
    }
    private async updateLikesCountPosts(): Promise<void> {
        const isUpdated = await this.postsSqlRepository.updateCountLikes()
        if(!isUpdated) throw new NotFoundException()
    }
    private async updateLikesCountComments(): Promise<void> {
        const isUpdated = await this.commentsSqlRepository.updateCountLikes()
        if(!isUpdated) throw new NotFoundException()
    }
}