import {UserInputModelDto} from "../../../../users/dto";

export class CreateUserCommand {
    constructor(public bodyDTO: UserInputModelDto, public dto?) {}
}