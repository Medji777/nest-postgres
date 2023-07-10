import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";
import {InjectDataSource} from "@nestjs/typeorm";
import {DeviceModel, DeviceViewModel} from "../../../types/security";
import {SecuritySqlType} from "../../../types/sql/security.sql";

@Injectable()
export class SecuritySqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {}

    async getAllActiveSessions(userId: string): Promise<Array<DeviceViewModel>> {
        const query = `
            select * from "Security" 
            where "userId"='${userId}' and "expiredTokenDate" > to_timestamp(${Date.now() / 1000.0})
        `;
        const data: SecuritySqlType[] = await this.dataSource.query(query)
        if(!data.length) return []
        return data.map(this._deviceModelMap)
    }

    async findSession(userId: string, deviceId: string): Promise<DeviceModel | null> {
        const query = `
            select * from "Security" 
            where "userId"='${userId}' and "deviceId"='${deviceId}'
        `;
        const [data]: SecuritySqlType[] = await this.dataSource.query(query)
        if(!data) return null

        return this._getSessionMap(data)
    }

    async checkSessionByDeviceId(deviceId: string): Promise<boolean> {
        const query = `select count(*) from "Security" where "deviceId"='${deviceId}'`;
        const [data] = await this.dataSource.query(query)
        return !!+data.count
    }

    private _deviceModelMap(model: SecuritySqlType): DeviceViewModel {
        return {
            ip: model.ip,
            title: model.title,
            lastActiveDate: model.lastActiveDate.toISOString(),
            deviceId: model.deviceId
        }
    }
    private _getSessionMap({lastActiveDate,expiredTokenDate,id,...rest}: SecuritySqlType): DeviceModel {
        return {
            lastActiveDate: lastActiveDate.toISOString(),
            expiredTokenDate: expiredTokenDate.toISOString(),
            ...rest
        }
    }
}