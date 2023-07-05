import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ name: 'checkRecoveryCode', async: true })
@Injectable()
export class CheckRecoveryCodeValidate implements ValidatorConstraintInterface {
  private error: string;
  constructor(private usersService: UsersService) {}
  async validate(code: string): Promise<boolean> {
    const resp = await this.usersService.checkRecoveryCode(code);
    if (resp.message) this.error = resp.message;
    return resp.check;
  }
  defaultMessage(): string {
    return this.error;
  }
}
