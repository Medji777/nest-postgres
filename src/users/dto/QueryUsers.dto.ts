import {IsOptional} from 'class-validator';
import { Trim, BanStatus as BanStatusSanitize, Stringify } from '../../utils/decorators';
import { PaginationDto } from '../../utils/dto/pagination.dto';
import { QueryUsers } from '../../types/users';
import { BanStatus } from "../../types/types";

export class QueryUsersDto extends PaginationDto implements QueryUsers {
  @IsOptional()
  @Trim()
  @Stringify()
  searchLoginTerm: string = '';
  @IsOptional()
  @Trim()
  @Stringify()
  searchEmailTerm: string = '';
  @IsOptional()
  @BanStatusSanitize()
  @Trim()
  banStatus: BanStatus = BanStatus.all
}
