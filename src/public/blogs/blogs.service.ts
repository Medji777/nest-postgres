import { Injectable } from '@nestjs/common';
import { BlogsSqlRepository } from "./repository/blogsSql.repository";

@Injectable()
export class BlogsService {
  constructor(
      private readonly blogsSqlRepository: BlogsSqlRepository
  ) {}
  async checkBlogById(id: string): Promise<boolean> {
    const blog = await this.blogsSqlRepository.findById(id);
    return !!blog
  }
}
