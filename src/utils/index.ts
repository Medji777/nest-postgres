export const equalSize = (a: Array<string | number>): boolean => {
  const filterArray = Array.from(new Set(a));
  return a.length === filterArray.length;
};

export const dateNullable = (v: Date | null): string | null => {
  return !v ? null : v.toISOString()
}

export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const ret: any = {};
  keys.forEach((key: K) => {
    if (obj[key]) ret[key] = obj[key];
  });
  return ret;
};

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  keys.forEach((key: K) => delete obj[key]);
  return obj;
};
