import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { settings } from '../../../config';
import { UsersQueryRepository } from '../../../users/repository/users.query-repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersQueryRepository.getUserByUserId(
      payload.userId,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
