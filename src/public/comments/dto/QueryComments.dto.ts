import { PaginationDto } from '../../../utils/dto/pagination.dto';
import { QueryComments } from '../../../types/comments';

export class QueryCommentsDto extends PaginationDto implements QueryComments {}
