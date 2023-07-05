import { Transform, TransformFnParams } from 'class-transformer';
import { sortDirectionSanitizer } from '../sanitize';

export function SortDirection(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    sortDirectionSanitizer(value),
  );
}
