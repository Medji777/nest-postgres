import { Transform, TransformFnParams } from 'class-transformer';

export function Stringify(): PropertyDecorator {
    return Transform(({ value }: TransformFnParams) =>
        value === 'null' ? '' : value,
    );
}