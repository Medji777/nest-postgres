import {BanInputDto} from "../../dto";

export class BanUserCommand {
    constructor(public userId: string, public bodyDTO: BanInputDto) {}
}