import {UserInputModelDto} from "../../../../users/dto";

export class SaveUserCommand {
    constructor(public bodyDTO: UserInputModelDto) {}
}