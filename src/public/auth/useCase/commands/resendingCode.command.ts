import {RegEmailResendingDto} from "../../dto";

export class ResendingCodeCommand {
    constructor(public bodyDTO: RegEmailResendingDto) {}
}