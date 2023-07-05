import { Transform, TransformFnParams } from 'class-transformer';

export function Nullable(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    value === 'null' ? null : value,
  );
}
