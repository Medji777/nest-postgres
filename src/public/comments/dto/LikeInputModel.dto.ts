import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeInputModel } from '../../../types/likes';
import { LikeStatus } from '../../../types/types';
import { Trim } from '../../../utils/decorators';

export class LikeInputModelDto implements LikeInputModel {
  @IsEnum(LikeStatus)
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  likeStatus: LikeStatus;
}
