import { Module } from '@nestjs/common';
import { PostsLikeSqlRepository } from "./repository/postsLikeSql.repository";

@Module({
  imports: [],
  providers: [PostsLikeSqlRepository],
  exports: [PostsLikeSqlRepository],
})
export class PostsLikeModule {}
