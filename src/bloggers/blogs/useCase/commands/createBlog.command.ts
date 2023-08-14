import {BlogsInputModelDTO} from "../../../../public/blogs/dto";
import {UsersSqlType} from "../../../../types/sql/user.sql";

export class CreateBlogCommand {
    constructor(public blogDto: BlogsInputModelDTO, public user: UsersSqlType) {}
}