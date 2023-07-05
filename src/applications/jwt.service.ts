import { Injectable } from '@nestjs/common';
import jwt, { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  async getDecodeTokenCustom(
    token: string,
    secret: string,
  ): Promise<JwtPayload | null> {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      return null;
    }
  }
}
