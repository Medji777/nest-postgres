import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersQueryRepository } from '../../users/repository/users.query-repository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'checkUniqueLoginOrEmail', async: true })
@Injectable()
export class CheckUniqueLoginOrEmailValidate implements ValidatorConstraintInterface {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  async validate(loginOrEmail: string): Promise<boolean> {
    return this.usersQueryRepository.getIsUniqueUserByLoginOrEmail(
      loginOrEmail,
    );
  }
  defaultMessage(): string {
    return 'User already registration';
  }
}
