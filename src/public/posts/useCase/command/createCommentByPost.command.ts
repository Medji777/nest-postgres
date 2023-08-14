import {CommentInputModelDto} from "../../../comments/dto";
import {UsersSqlType} from "../../../../types/sql/user.sql";

export class CreateCommentByPostCommand {
    public userId: string
    public userLogin: string
    constructor(public postId: string, private user: UsersSqlType, public bodyDTO: CommentInputModelDto) {
        this.userId = user.id;
        this.userLogin = user.login;
    }
}