import {CommandBus, CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {CreateCommentByPostCommand} from "../command";
import {CommentDBModel} from "../../../../types/comments";
import {PostsSqlRepository} from "../../repository/postsSql.repository";
import {BlogsUsersBanSqlRepository} from "../../../../bloggers/users/repository/blogsUsersBanSql.repository";
import {CreateCommentCommand} from "../../../comments/useCase/command";

@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostCommandHandler implements ICommandHandler<CreateCommentByPostCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly postsSqlRepository: PostsSqlRepository,
        private readonly blogsUsersBanSqlRepository: BlogsUsersBanSqlRepository,
    ) {}
    async execute(command: CreateCommentByPostCommand): Promise<CommentDBModel> {
        const {userId, userLogin, postId, bodyDTO} = command;

        const post = await this.postsSqlRepository.findById(postId)
        if (!post) throw new NotFoundException('post not found');

        const isBanned = await this.blogsUsersBanSqlRepository.checkBanStatusForBlog(userId,post.blogId)
        if(isBanned) throw new ForbiddenException()

        return this.commandBus.execute(new CreateCommentCommand({
            ...bodyDTO,
            postId: post.id,
            userId: userId,
            userLogin: userLogin,
            bloggerId: post.postOwnerId
        }))
    }
}