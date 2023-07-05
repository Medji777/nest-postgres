import {BlogPostInputModelDto} from "../../../../public/blogs/dto";

export class CreatePostForBlogCommand {
    constructor(public id: string, public userId: string, public bodyDTO: BlogPostInputModelDto) {}
}