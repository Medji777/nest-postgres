import { Injectable } from '@nestjs/common';
import { PostsLikeRepository } from './repository/postsLike.repository';

@Injectable()
export class PostsLikeService {
  constructor(private postsLikeRepository: PostsLikeRepository) {}
  async deleteAll(): Promise<void> {
    await this.postsLikeRepository.deleteAll();
  }
}
