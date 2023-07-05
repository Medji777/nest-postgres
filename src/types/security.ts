export type DeviceViewModel = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type DeviceModel = {
  ip: string;
  title: string;
  lastActiveDate: string;
  expiredTokenDate: string;
  deviceId: string;
  userId: string;
};

type JWTResponse = {
  expiredTokenDate: string;
  lastActiveTokenDate: string;
  iat: string;
  exp: string;
  [key: string]: any;
};

export type RefreshResponseType = {
  userId: string;
  deviceId: string;
};

export type RefreshPayloadType = JWTResponse & RefreshResponseType;
