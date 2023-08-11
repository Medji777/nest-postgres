import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsLike, PostsLikeSchema } from './entity/postsLike.schema';
import { PostsLikeRepository } from './repository/postsLike.repository';
import { PostsLikeQueryRepository } from './repository/postsLike.query-repository';
import { PostsLikeService } from './postsLike.service';
import { PostsLikeSqlRepository } from "./repository/postsLikeSql.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostsLike.name, schema: PostsLikeSchema }]),
  ],
  providers: [PostsLikeService, PostsLikeRepository, PostsLikeQueryRepository, PostsLikeSqlRepository],
  exports: [PostsLikeService, PostsLikeRepository, PostsLikeQueryRepository],
})
export class PostsLikeModule {}
