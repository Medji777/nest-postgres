import {BanStatus, SortDirections} from '../../types/types';

export const sortDirectionSanitizer = (v: keyof typeof SortDirections): SortDirections => {
  return !v || (!!v && !SortDirections[v]) ? SortDirections.desc : SortDirections[v];
};

export const banStatusSanitizer = (v: keyof typeof BanStatus): BanStatus => {
  return !v || (!!v && !BanStatus[v]) ? BanStatus.all : BanStatus[v];
};

export const numberSanitizer = (v: string, defaultValue: number): number => {
  return !v || (!isNaN(+v) && +v === 0) || isNaN(+v) ? defaultValue : +v;
};
