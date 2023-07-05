import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {NotFoundException} from "@nestjs/common";
import {UpdateStatusLikeCommand} from "../command";
import {PostsRepository} from "../../repository/posts.repository";
import {PostsLikeRepository} from "../../like/repository/postsLike.repository";
import {LikeCalculateService} from "../../../../applications/likeCalculate.service";
import {LikeStatus} from "../../../../types/types";

@CommandHandler(UpdateStatusLikeCommand)
export class UpdateStatusLikeCommandHandler implements ICommandHandler<UpdateStatusLikeCommand> {
    constructor(
        private postsRepository: PostsRepository,
        private postsLikeRepository: PostsLikeRepository,
        private likeCalculateService: LikeCalculateService,
    ) {}
    async execute(command: UpdateStatusLikeCommand): Promise<void> {
        const {userId, postId, login, bodyDTO: newStatus} = command;

        let lastStatus: LikeStatus = LikeStatus.None;
        const post = await this.postsRepository.findById(postId);
        if (!post) {
            throw new NotFoundException();
        }

        let likeInfo = await this.postsLikeRepository.findByUserIdAndPostId(userId,postId)

        if (!likeInfo) {
            likeInfo = await this.postsLikeRepository.create(
                userId,
                postId,
                login,
                newStatus.likeStatus,
            )
        } else {
            lastStatus = likeInfo.myStatus;
            likeInfo.updateStatus(newStatus.likeStatus)
        }

        const newLikesInfo = await this.likeCalculateService.getUpdatedLike(
            {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
            },
            lastStatus,
            newStatus.likeStatus,
        );
        post.updateLikeInPost(newLikesInfo);

        await this.postsLikeRepository.save(likeInfo);
        await this.postsRepository.save(post);
    }
}