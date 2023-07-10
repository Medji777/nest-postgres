import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { settings } from '../../../config';
import { UsersSqlRepository } from "../../../users/repository/users-sql.repository";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersSqlRepository.findById(
      payload.userId,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
