import {BanInputDto} from "../../../sa/users/dto";
import {IsNotEmpty, IsString} from "class-validator";
import {Trim} from "../../../utils/decorators";

export class BanUnbanInputDto extends BanInputDto {
    @IsNotEmpty()
    @Trim()
    @IsString()
    blogId: string;
}