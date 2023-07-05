import { PaginationDto } from '../../../utils/dto/pagination.dto';
import { QueryPosts } from '../../../types/posts';

export class QueryPostsDto extends PaginationDto implements QueryPosts {}
