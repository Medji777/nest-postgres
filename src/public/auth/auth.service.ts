import { Injectable } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {settings} from "../../config";

type Response = {
  accessToken: string,
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async createTokens(userId: string, deviceId: string): Promise<Response> {
    const accessToken = await this.jwtService.signAsync(
        { userId },
        { expiresIn: '10s', secret: settings.JWT_SECRET },
    );
    const refreshToken = await this.jwtService.signAsync(
        { userId, deviceId },
        { expiresIn: '20s', secret: settings.JWT_SECRET },
    );
    return {
      accessToken,
      refreshToken
    }
  }
}
