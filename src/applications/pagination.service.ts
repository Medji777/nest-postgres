import {Injectable} from '@nestjs/common';
import {transformPagination} from "../utils/transform";
import {PaginationDto} from "../utils/dto/pagination.dto";

type Pagination<D> = {
  doc: D | any;
  pageSize: number;
  pageNumber: number;
  count: number;
};

@Injectable()
export class PaginationService {
  public transformPagination<T,D>(pagination: Pagination<D>) {
    return transformPagination<T>(
        pagination.doc,
        pagination.pageSize,
        pagination.pageNumber,
        pagination.count,
    )
  }
  public paginationOptions(queryDto: PaginationDto): string {
    return `
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize}
             offset ${(queryDto.pageNumber - 1) * queryDto.pageSize}
    `
  }
}
