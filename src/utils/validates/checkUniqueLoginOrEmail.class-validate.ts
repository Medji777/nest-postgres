import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersSqlQueryRepository } from "../../users/repository/users-sql.query-repository";

@ValidatorConstraint({ name: 'checkUniqueLoginOrEmail', async: true })
@Injectable()
export class CheckUniqueLoginOrEmailValidate implements ValidatorConstraintInterface {
  constructor(
      private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async validate(loginOrEmail: string): Promise<boolean> {
    const res = await this.usersSqlQueryRepository.getUserByLoginOrEmail(
        loginOrEmail
    );
    return !res
  }
  defaultMessage(): string {
    return 'User already registration';
  }
}
