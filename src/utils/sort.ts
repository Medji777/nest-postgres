import { SortDirections } from '../types/types';

export const getSortNumber = (sort: SortDirections) =>
  SortDirections.desc === sort ? -1 : 1;
