import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../utils/decorators';
import { BlogsInputModel } from '../../../types/blogs';

export class BlogsInputModelDTO implements BlogsInputModel {
  @MaxLength(13, { message: 'input is max 13 symbol' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly name: string;
  @MaxLength(500, { message: 'input is max 500 symbol' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly description: string;
  @MaxLength(100, { message: 'input is max 100 symbol' })
  @IsUrl({ protocols: ['https'] }, { message: 'input is URL' })
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  readonly websiteUrl: string;
}
