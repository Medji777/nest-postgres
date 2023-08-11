import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {BanUserCommand} from "../command";
import {UsersSqlRepository} from "../../../../users/repository/users-sql.repository";
import {BlogsSqlRepository} from "../../../../public/blogs/repository/blogsSql.repository";
import {BlogsUsersBanSqlRepository} from "../../repository/blogsUsersBanSql.repository";

@CommandHandler(BanUserCommand)
export class BanUserCommandHandler implements ICommandHandler<BanUserCommand> {
    constructor(
        private readonly usersSqlRepository: UsersSqlRepository,
        private readonly blogsSqlRepository: BlogsSqlRepository,
        private readonly blogsUsersBanSqlRepository: BlogsUsersBanSqlRepository
    ) {}
    async execute(command: BanUserCommand): Promise<any> {
        const {userId, bloggerId, bodyDTO} = command;

        const blog = await this.blogsSqlRepository.findById(bodyDTO.blogId);
        if(!blog) throw new NotFoundException();
        if(blog.userId !== bloggerId) throw new ForbiddenException();

        const user = await this.usersSqlRepository.findById(userId);
        if(!user) throw new NotFoundException();

        await this.blogsUsersBanSqlRepository.updateBloggerBan(
            userId, bodyDTO.blogId, bodyDTO.banReason, bodyDTO.isBanned
        )
    }
}