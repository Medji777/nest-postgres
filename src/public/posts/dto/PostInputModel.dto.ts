import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { Trim } from '../../../utils/decorators';
import { CheckBlogIdValidate } from "../../../utils/validates";
import { PostInputModel } from '../../../types/posts';

export class PostInputModelDto implements PostInputModel {
  @IsString({ message: 'input is string' })
  @Trim()
  @IsNotEmpty({ message: 'input is required' })
  @MaxLength(30, { message: 'input is max 30 symbol' })
  readonly title: string;
  @IsString({ message: 'input is string' })
  @Trim()
  @IsNotEmpty({ message: 'input is required' })
  @MaxLength(100, { message: 'input is max 100 symbol' })
  readonly shortDescription: string;
  @IsString({ message: 'input is string' })
  @Trim()
  @IsNotEmpty({ message: 'input is required' })
  @MaxLength(1000, { message: 'input is max 1000 symbol' })
  readonly content: string;
  @Validate(CheckBlogIdValidate)
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly blogId: string;
}
