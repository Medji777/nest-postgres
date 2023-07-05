import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityService } from '../../security/security.service';
import { settings } from '../../../config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private readonly securityService: SecurityService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
          JwtRefreshStrategy.refreshCookieExtractor
      ]),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const data = await this.securityService.checkRefreshTokenParsed(payload);
    if (data?.userId && data?.deviceId) {
      return {
        userId: data.userId,
        deviceId: data.deviceId,
      };
    }
    throw new UnauthorizedException();
  }

  private static refreshCookieExtractor (req): string | null {
    if(req.cookies && 'refreshToken' in req.cookies) {
      return req.cookies.refreshToken
    }
    return null
  }
}
