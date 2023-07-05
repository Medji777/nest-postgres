import {CommentInputModelDto} from "../../../comments/dto";
import {Users} from "../../../../users/entity/users.schema";

export class CreateCommentByPostCommand {
    public userId: string
    public userLogin: string
    constructor(public postId: string, private user: Users, public bodyDTO: CommentInputModelDto) {
        this.userId = user.id;
        this.userLogin = user.login;
    }
}