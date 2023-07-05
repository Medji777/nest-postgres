import {LikeInputModelDto} from "../../dto";

export class UpdateStatusLikeCommand {
    constructor(
        public userId: string,
        public login: string,
        public postId: string,
        public bodyDTO: LikeInputModelDto
    ) {}
}