import {BlogsInputModelDTO} from "../../../../public/blogs/dto";
import {Users} from "../../../../users/entity/users.schema";

export class CreateBlogCommand {
    constructor(public blogDto: BlogsInputModelDTO, public user: Users) {}
}