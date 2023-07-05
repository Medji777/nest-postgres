import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {SecuritySqlType} from "../../../types/sql/security.sql";
import {DeleteResponse, UpdateResponse} from "../../../types/sql/types";

export class SecuritySqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createSession(
        ip: string,
        title: string,
        userId: string,
        deviceId: string,
        lastActiveDate: string,
        expiredTokenDate: string,
    ): Promise<SecuritySqlType> {
        const query = `
            insert into "Security" (ip,title,"lastActiveDate","expiredTokenDate","deviceId","userId") 
            values (
            '${ip}','${title}','${lastActiveDate}','${expiredTokenDate}','${deviceId}','${userId}'
            ) RETURNING *`;
        const [data]: SecuritySqlType[] = await this.dataSource.query(query)
        return data
    }

    async findSession(userId: string, deviceId: string): Promise<SecuritySqlType> {
        const query = `
            select * from "Security" where "userId"='${userId}' and "deviceId"='${deviceId}'
        `;
        const [data]: SecuritySqlType[] = await this.dataSource.query(query);
        return data
    }

    async updateSession(userId: string, deviceId: string, lastActiveDate: string): Promise<boolean> {
        const query = `
            update "Security" set "lastActiveDate"='${lastActiveDate}' 
            where "userId"='${userId}' and "deviceId"='${deviceId}'
        `;
        const [data]: UpdateResponse<SecuritySqlType> = await this.dataSource.query(query)
        return !!data
    }

    async deleteAllSessionsWithoutCurrent(userId: string, deviceId: string): Promise<boolean> {
        const query = `delete from "Security" where "userId"='${userId}' and "deviceId"!='${deviceId}'`;
        const res: DeleteResponse<SecuritySqlType> = await this.dataSource.query(query)
        return !!res[1]
    }

    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const query = `delete from "Security" where "deviceId"='${deviceId}'`;
        const res: DeleteResponse<SecuritySqlType> = await this.dataSource.query(query)
        return !!res[1]
    }

    async deleteAllByUserId(userId: string): Promise<boolean> {
        const query = `delete from "Security" where "userId"='${userId}'`;
        const res: DeleteResponse<SecuritySqlType> = await this.dataSource.query(query);
        return !!res[1]
    }
}