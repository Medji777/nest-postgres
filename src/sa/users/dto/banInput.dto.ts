import {BanInputModel} from "../../../types/users";
import {IsBoolean, IsString, MinLength} from "class-validator";
import {Trim} from "../../../utils/decorators";

export class BanInputDto implements BanInputModel {
    @IsBoolean()
    isBanned: boolean
    @MinLength(20)
    @Trim()
    @IsString()
    banReason: string
}