import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { settings } from '../../../config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }
  async validate(req, username, password) {
    if (settings.BASIC_LOGIN !== username && settings.BASIC_PASS !== password) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
