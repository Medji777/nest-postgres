import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Security, SecurityModelType } from '../entity/security.schema';
import { DeviceModel, DeviceViewModel } from '../../../types/security';

const projectionInit = { _id: 0, __v: 0 };

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}
  async getAllActiveSessions(userId: string): Promise<Array<DeviceViewModel>> {
    return this.SecurityModel.find(
      { userId },
      { expiredTokenDate: 0, userId: 0, ...projectionInit },
    ).lean();
  }
  async findSession(
    userId: string,
    deviceId: string,
  ): Promise<DeviceModel | null> {
    return this.SecurityModel.findOne(
      { userId, deviceId },
      projectionInit,
    ).lean();
  }
  async checkSessionByDeviceId(deviceId: string): Promise<boolean> {
    const count = await this.SecurityModel.countDocuments({ deviceId });
    return !!count;
  }
}
