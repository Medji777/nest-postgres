import { IsOptional } from 'class-validator';
import { Stringify, Trim } from '../../../utils/decorators';
import { PaginationDto } from '../../../utils/dto/pagination.dto';
import { QueryBlogs } from '../../../types/blogs';

export class QueryBlogsDTO extends PaginationDto implements QueryBlogs {
  @IsOptional()
  @Trim()
  @Stringify()
  readonly searchNameTerm: string = '';
}
