import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../utils/decorators';
import { BlogPostInputModel } from '../../../types/blogs';

export class BlogPostInputModelDto implements BlogPostInputModel {
  @MaxLength(30, { message: 'input is max 30 symbol' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly title: string;
  @MaxLength(100, { message: 'input is max 100 symbol' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly shortDescription: string;
  @MaxLength(1000, { message: 'input is max 1000 symbol' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly content: string;
}
