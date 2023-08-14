import {LikeInputModelDto} from "../../dto";

export class UpdateStatusLikeCommand {
    constructor(
        public commentId: string,
        public userId: string,
        public bodyDTO: LikeInputModelDto
    ) {}
}