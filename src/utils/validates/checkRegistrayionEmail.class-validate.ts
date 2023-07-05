import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ name: 'checkRegistrationEmail', async: true })
@Injectable()
export class CheckRegistrationEmailValidate implements ValidatorConstraintInterface {
  private error: string;
  constructor(private usersService: UsersService) {}
  async validate(email: string): Promise<boolean> {
    const resp = await this.usersService.checkRegEmail(email);
    if (resp.message) this.error = resp.message;
    return resp.check;
  }
  defaultMessage(): string {
    return this.error;
  }
}
