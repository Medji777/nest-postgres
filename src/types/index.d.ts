import {UsersSqlType} from './sql/user.sql'

declare global {
  declare namespace Express {
    export interface Request {
      user: UsersSqlType & { userId?: string; deviceId?: string } | null;
      deviceId: string | null;
    }
  }
}
