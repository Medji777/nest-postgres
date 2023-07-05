import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEqual } from 'date-fns';
import { SecurityRepository } from './repository/security.repository';
import { RefreshResponseType } from '../../types/security';
import {SecuritySqlRepository} from "./repository/securitySql.repository";

@Injectable()
export class SecurityService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityRepository: SecurityRepository,
    private readonly securitySqlRepository: SecuritySqlRepository
  ) {}
  async checkRefreshTokenParsed(meta): Promise<RefreshResponseType | null> {
    if (meta?.userId) {
      const lastActiveTokenData = new Date(+meta.iat * 1000);
      const data = await this.securitySqlRepository.findSession(
        meta.userId,
        meta.deviceId,
      );
      if (data && isEqual(lastActiveTokenData, new Date(data.lastActiveDate.toISOString()))) {
        return {
          userId: meta.userId,
          deviceId: meta.deviceId,
        };
      }
    }
    return null;
  }
  async deleteAll(): Promise<void> {
    await this.securityRepository.deleteAll();
  }

  async createSessionSql(
      refreshToken: string,
      deviceName: string,
      ip: string,
  ): Promise<void> {
    const meta = await this.jwtService.verifyAsync(refreshToken);
    await this.securitySqlRepository.createSession(
        ip,
        deviceName,
        meta.userId,
        meta.deviceId,
        new Date(meta.iat * 1000).toISOString(),
        new Date(meta.exp * 1000).toISOString(),
    );
  }

  async updateLastActiveDataSessionSql(refreshToken: string): Promise<void> {
    const meta = await this.jwtService.verifyAsync(refreshToken);
    const lastActiveDate = new Date(meta.iat * 1000).toISOString();
    const isUpdated = await this.securitySqlRepository.updateSession(
        meta.userId,
        meta.deviceId,
        lastActiveDate
    )
    if (!isUpdated) {
      throw new BadRequestException();
    }
  }

  async deleteSessionByDeviceIdSql(
      deviceId: string,
      isException: boolean = false,
  ): Promise<boolean> {
    const isDeleted = this.securitySqlRepository.deleteSessionByDeviceId(deviceId);
    if (isException && !isDeleted) {
      throw new NotFoundException();
    }
    return isDeleted;
  }

}
