export class DeletePostByBlogCommand {
    constructor(
        public blogId: string,
        public postId: string,
        public userId: string
    ) {}
}