import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches, Validate,
} from 'class-validator';
import { Trim } from '../../utils/decorators';
import { UserInputModel } from '../../types/users';
import {
  CheckUniqueEmailValidate,
  CheckUniqueLoginValidate
} from "../../utils/validates";

export class UserInputModelDto implements UserInputModel {
  @Validate(CheckUniqueLoginValidate)
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsNotEmpty()
  @Trim()
  @IsString({ message: 'input is string' })
  login: string;
  @Length(6, 20)
  @IsNotEmpty()
  @Trim()
  @IsString({ message: 'input is string' })
  password: string;
  @Validate(CheckUniqueEmailValidate)
  @IsEmail()
  //@Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsNotEmpty()
  @Trim()
  @IsString({ message: 'input is string' })
  email: string;
}
