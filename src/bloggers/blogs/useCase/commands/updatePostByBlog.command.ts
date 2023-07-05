import {UpdatePostDto} from "../../dto";

export class UpdatePostByBlogCommand {
    constructor(
        public blogId: string,
        public postId: string,
        public userId: string,
        public bodyDTO: UpdatePostDto
    ) {}
}