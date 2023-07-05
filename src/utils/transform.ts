import { Paginator } from '../types/types';

export const transformPagination = <T>(
  items: Array<T>,
  pageSize: number,
  pageNumber: number,
  count: number,
): Paginator<T> => {
  return {
    pagesCount: Math.ceil(count / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount: count,
    items,
  };
};
