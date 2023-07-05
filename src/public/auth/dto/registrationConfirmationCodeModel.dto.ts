import { IsString, Validate } from 'class-validator';
import { RegistrationConfirmationCodeModel } from '../../../types/auth';
import { Trim } from '../../../utils/decorators';
import { CodeConfirmValidate } from '../../../utils/validates';

export class RegConfirmCodeModelDto implements RegistrationConfirmationCodeModel {
  @Validate(CodeConfirmValidate)
  @Trim()
  @IsString({ message: 'input is string' })
  code: string;
}
