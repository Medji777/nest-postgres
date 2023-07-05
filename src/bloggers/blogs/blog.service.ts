import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {BlogsRepository} from "../../public/blogs/repository/blogs.repository";
import {BlogDocument} from "../../public/blogs/entity/blogs.schema";

@Injectable()
export class BlogService {
    constructor(private blogsRepository: BlogsRepository) {}
    async checkExistAndGet(id: string, userId: string): Promise<BlogDocument> {
        const blog = await this.blogsRepository.findById(id)
        if(!blog){
            throw new NotFoundException('blog not found')
        }
        if(!blog.checkIncludeUser(userId)) {
            throw new ForbiddenException()
        }
        return blog
    }
}