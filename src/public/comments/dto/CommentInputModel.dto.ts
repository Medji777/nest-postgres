import { IsString, Length } from 'class-validator';
import { Trim } from '../../../utils/decorators';
import { CommentInputModel } from '../../../types/comments';

export class CommentInputModelDto implements CommentInputModel {
  @IsString({ message: 'input is string' })
  @Trim()
  @Length(20, 300)
  content: string;
}
