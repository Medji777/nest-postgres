import { Injectable } from '@nestjs/common';
import {PostsLikeSqlRepository} from "./repository/postsLikeSql.repository";

@Injectable()
export class PostsLikeService {
  constructor(private postsLikeSqlRepository: PostsLikeSqlRepository) {}
  async deleteAll(): Promise<void> {
    await this.postsLikeSqlRepository.deleteAll();
  }
}
