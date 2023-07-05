export type SecuritySqlType = {
    id: number;
    ip: string;
    title: string;
    lastActiveDate: Date;
    expiredTokenDate: Date;
    deviceId: string;
    userId: string;
};