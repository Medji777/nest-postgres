import {BanUnbanInputDto} from "../../dto";
import {UsersSqlType} from "../../../../types/sql/user.sql";

export class BanUserCommand {
    public bloggerId: string
    constructor(
        public userId: string,
        private user: UsersSqlType,
        public bodyDTO: BanUnbanInputDto
    ) {
        this.bloggerId = user.id
    }
}