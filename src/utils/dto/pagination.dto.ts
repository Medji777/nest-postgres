import { IsInt, IsOptional } from 'class-validator';
import { NumberSanitize, SortDirection, Trim } from '../decorators';
import { SortDirections } from '../../types/types';

export class PaginationDto {
  @IsOptional()
  @Trim()
  readonly sortBy: string = 'createdAt';
  @IsOptional()
  @SortDirection()
  @Trim()
  readonly sortDirection: SortDirections = SortDirections.desc;
  @IsOptional()
  @NumberSanitize(1)
  @IsInt()
  readonly pageNumber: number = 1;
  @IsOptional()
  @NumberSanitize(10)
  @IsInt()
  readonly pageSize: number = 10;
}
