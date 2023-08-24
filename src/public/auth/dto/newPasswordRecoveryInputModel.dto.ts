import {IsNotEmpty, IsString, IsUUID, Length, Validate} from 'class-validator';
import { NewPasswordRecoveryInputModel } from '../../../types/auth';
import { Trim } from '../../../utils/decorators';
import { CheckRecoveryCodeValidate } from '../../../utils/validates';

export class NewPassRecIMDto implements NewPasswordRecoveryInputModel {
  @Length(6, 20, { message: 'input is min 6 and max 20 symbol' })
  @IsNotEmpty()
  @Trim()
  @IsString()
  newPassword: string;
  @Validate(CheckRecoveryCodeValidate)
  @IsUUID()
  @IsNotEmpty()
  @Trim()
  recoveryCode: string;
}
