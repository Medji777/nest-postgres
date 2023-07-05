import { RegistrationEmailResending } from '../../../types/auth';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { Trim } from '../../../utils/decorators';
import { CheckRegistrationEmailValidate } from '../../../utils/validates';

export class RegEmailResendingDto implements RegistrationEmailResending {
  @Validate(CheckRegistrationEmailValidate)
  @IsEmail()
  @IsNotEmpty({ message: 'input is required' })
  @Trim()
  @IsString({ message: 'input is string' })
  email: string;
}
