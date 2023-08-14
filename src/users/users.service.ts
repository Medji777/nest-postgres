import { Injectable } from '@nestjs/common';
import { PassHashService } from '../applications/passHash.service';
import { ErrorResponse } from '../types/types';
import { UsersSqlType } from "../types/sql/user.sql";
import { UsersSqlRepository } from "./repository/users-sql.repository";

type Cred = {
  check: boolean;
  user: UsersSqlType | null;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly passHashService: PassHashService,
  ) {}

  async checkConfirmCode(code: string): Promise<ErrorResponse> {
    const user = await this.usersSqlRepository.getUserByUUIDCode(code);
    if (!user) {
      return {
        check: false,
        message: "user with this code don't exist in the DB",
      };
    }
    const resp = await this.checkValidCode(user);
    if (!resp.check && resp.code === 'confirm') {
      return {
        check: resp.check,
        message: 'email is already confirmed',
      };
    }
    if (!resp.check && resp.code === 'expired') {
      return {
        check: resp.check,
        message: 'code expired',
      };
    }
    return { check: true };
  }
  async checkRegEmail(email: string): Promise<ErrorResponse> {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(email);
    if (!user) {
      return {
        check: false,
        message: "user with this code don't exist in the DB",
      };
    }
    const resp = await this.checkValidCode(user,true);
    if (!resp.check && resp.code === 'confirm') {
      return {
        check: resp.check,
        message: 'email is already confirmed',
      };
    }
    return { check: true };
  }
  async checkRecoveryCode(code: string): Promise<ErrorResponse> {
    const user = await this.usersSqlRepository.getUserByUUIDCode(code);
    if (!user) {
      return {
        check: false,
        message: "user with this code don't exist in the DB",
      };
    }
    const resp = await this.checkValidRecoveryCode(user);
    if (!resp.check && resp.code === 'expired') {
      return {
        check: resp.check,
        message: 'code expired',
      };
    }
    return { check: true };
  }
  async checkCredentials(input: string, password: string): Promise<Cred> {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(input);
    if (!user) {
      return {
        check: false,
        user: null,
      };
    } else {
      const check = await this.passHashService.validate(password, user.passwordHash);
      return {
        check,
        user,
      };
    }
  }

  private async checkValidCode(model: UsersSqlType, isEmail: boolean = false): Promise<ErrorResponse> {
    if (model.emailIsConfirmed) {
      return {
        check: false,
        code: 'confirm',
      };
    }
    const expirationDate = model.emailExpirationDate;
    if (!isEmail && expirationDate && expirationDate < new Date()) {
      return {
        check: false,
        code: 'expired',
      };
    }
    return {
      check: true,
    };
  }
  private async checkValidRecoveryCode(model: UsersSqlType): Promise<ErrorResponse> {
    const expirationDate = model.passwordExpirationDate;
    if (expirationDate && expirationDate < new Date()) {
      return {
        check: false,
        code: 'expired',
      };
    }
    return {
      check: true,
    };
  }
}
