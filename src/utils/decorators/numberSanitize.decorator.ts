import { Transform, TransformFnParams } from 'class-transformer';
import { numberSanitizer } from '../sanitize';

export function NumberSanitize(defaultValue: number): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    numberSanitizer(value, defaultValue),
  );
}
