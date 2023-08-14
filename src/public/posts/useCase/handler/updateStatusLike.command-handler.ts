import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {UpdateStatusLikeCommand} from "../command";
// import {LikeCalculateService} from "../../../../applications/likeCalculate.service";
// import {LikeStatus} from "../../../../types/types";
import {PostsSqlRepository} from "../../repository/postsSql.repository";
import {PostsLikeSqlRepository} from "../../like/repository/postsLikeSql.repository";
import {BlogsUsersBanSqlRepository} from "../../../../bloggers/users/repository/blogsUsersBanSql.repository";
import {LikeStatus} from "../../../../types/types";

@CommandHandler(UpdateStatusLikeCommand)
export class UpdateStatusLikeCommandHandler implements ICommandHandler<UpdateStatusLikeCommand> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private postsLikeSqlRepository: PostsLikeSqlRepository,
        private blogsUsersBanRepository: BlogsUsersBanSqlRepository,
       // private likeCalculateService: LikeCalculateService,
    ) {}
    async execute(command: UpdateStatusLikeCommand): Promise<void> {
        const {userId, postId, bodyDTO: newStatus} = command;

        //let lastStatus: LikeStatus = LikeStatus.None;
        const post = await this.postsSqlRepository.findById(postId)
        if (!post) throw new NotFoundException();

        const isBanned = await this.blogsUsersBanRepository.checkBanStatusForBlog(userId,post.blogId);
        if(isBanned) throw new ForbiddenException()

        await Promise.all([
            this.updateStatus(userId,postId,newStatus.likeStatus),
            this.updateCountLikes(userId,postId)
        ])

        //await this.updateStatus(userId,postId,newStatus.likeStatus)
        // const newLikesInfo = this.likeCalculateService.getUpdatedLike(
        //     {
        //         likesCount: post.likesCount,
        //         dislikesCount: post.dislikesCount,
        //     },
        //     lastStatus,
        //     newStatus.likeStatus,
        // );
        // await this.postsSqlRepository.updateCountLikesInPost(post.id,newLikesInfo)
        //await this.postsSqlRepository.updateCountLikesInPost1(post.id,userId)
    }

    private async updateStatus(userId: string, postId: string, likeStatus: LikeStatus): Promise<void> {
        const likeInfo = await this.postsLikeSqlRepository.findByUserIdAndPostId(userId,postId)

        if (!likeInfo) {
            await this.postsLikeSqlRepository.create(
                userId,
                postId,
                likeStatus,
            )
        } else {
            //lastStatus = likeInfo.myStatus;
            await this.postsLikeSqlRepository.updateStatus(
                userId,
                postId,
                likeStatus
            )
        }
    }
    private async updateCountLikes(userId: string, postId: string): Promise<void> {
        await this.postsSqlRepository.updateCountLikesInPost1(postId,userId)
    }
}