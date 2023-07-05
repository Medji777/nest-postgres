import {PaginationDto} from "../../../utils/dto/pagination.dto";
import {IsOptional} from "class-validator";
import {Trim} from "../../../utils/decorators";

export class QueryUsersDto extends PaginationDto {
    @IsOptional()
    @Trim()
    readonly searchLoginTerm: string | null = null;
}