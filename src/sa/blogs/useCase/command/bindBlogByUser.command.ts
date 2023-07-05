export class BindBlogByUserCommand {
    constructor(
        public blogId: string,
        public userId: string
    ) {}
}