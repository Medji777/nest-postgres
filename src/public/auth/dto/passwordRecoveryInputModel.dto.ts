import { PasswordRecoveryInputModel } from '../../../types/auth';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../utils/decorators';

export class PasswordRecoveryInputModelDto
  implements PasswordRecoveryInputModel
{
  @IsEmail()
  @IsNotEmpty()
  @Trim()
  @IsString()
  email: string;
}
