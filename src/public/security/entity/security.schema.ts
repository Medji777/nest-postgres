import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type SecurityDocument = HydratedDocument<Security>;
export type SecurityModelType = Model<SecurityDocument> & SecurityModelStatic;

@Schema()
export class Security {
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  expiredTokenDate: string;
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  userId: string;

  update(payload) {
    this.lastActiveDate = payload.lastActiveDate;
  }

  static make(
    ip: string,
    title: string,
    userId: string,
    deviceId: string,
    lastActiveDate: string,
    expiredTokenDate: string,
    SecurityModel: SecurityModelType,
  ) {
    const newSession = {
      ip,
      title,
      userId,
      deviceId,
      lastActiveDate,
      expiredTokenDate,
    };
    return new SecurityModel(newSession);
  }
}

export const SecuritySchema = SchemaFactory.createForClass(Security);

SecuritySchema.methods = {
  update: Security.prototype.update,
};

const staticsMethods = {
  make: Security.make,
};

SecuritySchema.statics = staticsMethods;

export type SecurityModelStatic = {
  make(
    ip: string,
    title: string,
    userId: string,
    deviceId: string,
    lastActiveDate: string,
    expiredTokenDate: string,
    SecurityModel: SecurityModelType,
  ): SecurityDocument;
};
