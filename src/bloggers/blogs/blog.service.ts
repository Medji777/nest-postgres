import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {BlogsSqlRepository} from "../../public/blogs/repository/blogsSql.repository";
import {BlogsSqlType} from "../../types/sql/blogs.sql";

@Injectable()
export class BlogService {
    constructor(private blogsSqlRepository: BlogsSqlRepository) {}
    async checkExistAndGet(id: string, userId: string): Promise<BlogsSqlType> {
        const blog = await this.blogsSqlRepository.findById(id)
        if(!blog) throw new NotFoundException('blog not found');
        if(blog.userId !== userId) throw new ForbiddenException();
        return blog
    }
}