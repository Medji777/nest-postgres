import {BanBlogInputDto} from "../../dto";

export class BanBlogCommand {
    constructor(
        public blogId: string,
        public bodyDTO: BanBlogInputDto
    ) {}
}