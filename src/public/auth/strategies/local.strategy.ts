import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
      private readonly usersService: UsersService
  ) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string }> {
    const checkData = await this.usersService.checkCredentials(
      loginOrEmail,
      password,
    );
    if (!checkData.user || !checkData.check) {
      throw new UnauthorizedException();
    }
    if(checkData.user.isBanned) {
      throw new UnauthorizedException();
    }
    if (!checkData.user.emailIsConfirmed) {
      throw new UnauthorizedException();
    }
    return checkData.user;
  }
}
