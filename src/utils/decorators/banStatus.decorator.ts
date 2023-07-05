import {Transform, TransformFnParams} from "class-transformer";
import {banStatusSanitizer} from "../sanitize";

export function BanStatus(): PropertyDecorator {
    return Transform(({ value }: TransformFnParams) =>
        banStatusSanitizer(value),
    );
}