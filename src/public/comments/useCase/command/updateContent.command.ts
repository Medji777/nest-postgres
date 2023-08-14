import {CommentInputModelDto} from "../../dto";

export class UpdateContentCommand {
    public content
    constructor(public id: string, public payload: CommentInputModelDto) {
        this.content = payload.content
    }
}