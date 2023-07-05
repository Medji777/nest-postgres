import {Users} from "../../../../users/entity/users.schema";
import {BanUnbanInputDto} from "../../dto";

export class BanUserCommand {
    public bloggerId: string
    constructor(
        public userId: string,
        private user: Users,
        public bodyDTO: BanUnbanInputDto
    ) {
        this.bloggerId = user.id
    }
}