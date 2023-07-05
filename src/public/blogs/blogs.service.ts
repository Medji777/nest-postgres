import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './repository/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async checkBlogById(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.findById(id);
    return !!blog
  }
  async deleteAll(): Promise<void> {
    await this.blogsRepository.deleteAll();
  }
}
