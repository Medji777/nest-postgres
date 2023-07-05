import { LikeInputModel } from '../../../types/likes';
import { LikeStatus } from '../../../types/types';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../utils/decorators';

export class LikeInputModelDto implements LikeInputModel {
  @IsString({ message: 'input is string' })
  @Trim()
  @IsNotEmpty({ message: 'input is required' })
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
