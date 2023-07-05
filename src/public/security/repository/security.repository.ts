import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../entity/security.schema';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}
  createSession(
    ip: string,
    title: string,
    userId: string,
    deviceId: string,
    lastActiveDate: string,
    expiredTokenDate: string,
  ) {
    return this.SecurityModel.make(
      ip,
      title,
      userId,
      deviceId,
      lastActiveDate,
      expiredTokenDate,
      this.SecurityModel,
    );
  }
  async findSession(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDocument> {
    return this.SecurityModel.findOne({ userId, deviceId });
  }
  async deleteAllSessionsWithoutCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const result = await this.SecurityModel.deleteMany({
      userId,
      deviceId: { $nin: [deviceId] },
    });
    return !!result.deletedCount;
  }
  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.SecurityModel.deleteOne({ deviceId });
    return !!result.deletedCount;
  }
  async save(model: SecurityDocument): Promise<void> {
    await model.save();
  }
  async deleteAll(): Promise<void> {
    await this.SecurityModel.deleteMany({});
  }
  async deleteAllByUserId(userId: string): Promise<void> {
    await this.SecurityModel.deleteMany({userId});
  }
}
