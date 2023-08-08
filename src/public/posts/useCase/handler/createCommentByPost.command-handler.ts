import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {CreateCommentByPostCommand} from "../command";
import {CommentsService} from "../../../comments/comments.service";
import {CommentDBModel} from "../../../../types/comments";
import {PostsSqlRepository} from "../../repository/postsSql.repository";
import {BlogsUsersBanSqlRepository} from "../../../../bloggers/users/repository/blogsUsersBanSql.repository";

@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostCommandHandler implements ICommandHandler<CreateCommentByPostCommand> {
    constructor(
        private readonly postsSqlRepository: PostsSqlRepository,
        private readonly blogsUsersBanSqlRepository: BlogsUsersBanSqlRepository,
        private readonly commentsService: CommentsService,
    ) {}
    async execute(command: CreateCommentByPostCommand): Promise<CommentDBModel> {
        const {userId, userLogin, postId, bodyDTO} = command;

        const post = await this.postsSqlRepository.findById(postId)
        if (!post) throw new NotFoundException('post not found');

        const isBanned = await this.blogsUsersBanSqlRepository.checkBanStatusForBlog(userId,post.blogId)
        if(isBanned) throw new ForbiddenException()

        return this.commentsService.create({
            ...bodyDTO,
            postId: post.id,
            userId: userId,
            userLogin: userLogin,
            bloggerId: post.postOwnerId
        })
    }
}