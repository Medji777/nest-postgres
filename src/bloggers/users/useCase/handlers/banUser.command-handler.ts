import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {BanUserCommand} from "../command";
import {UsersRepository} from "../../../../users/repository/users.repository";
import {BlogsRepository} from "../../../../public/blogs/repository/blogs.repository";

@CommandHandler(BanUserCommand)
export class BanUserCommandHandler implements ICommandHandler<BanUserCommand> {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly blogsRepository: BlogsRepository
    ) {}
    async execute(command: BanUserCommand): Promise<any> {
        const {userId, bloggerId, bodyDTO} = command;

        const blog = await this.blogsRepository.findById(bodyDTO.blogId);
        if(!blog) throw new NotFoundException();
        if(!blog.checkIncludeUser(bloggerId)) throw new ForbiddenException();

        const user = await this.usersRepository.findById(userId);
        if(!user) throw new NotFoundException();

        user.updateBloggerBan(bodyDTO.isBanned, bodyDTO.banReason, bodyDTO.blogId);
        await this.usersRepository.save(user);
    }
}