import {IsOptional} from "class-validator";
import {PaginationDto} from "../../../utils/dto/pagination.dto";
import {Stringify, Trim} from "../../../utils/decorators";

export class QueryUsersDto extends PaginationDto {
    @IsOptional()
    @Trim()
    @Stringify()
    readonly searchLoginTerm: string = '';
}