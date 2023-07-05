import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {UsersSqlType} from "../../types/sql/user.sql";
import {
    BanInputModel,
    EmailConfirmUserModel,
    PasswordConfirmUserModel,
    PasswordHash
} from "../../types/users";
import {DeleteResponse, UpdateResponse} from "../../types/sql/types";
import {dateNullable} from "../../utils";

type PayloadType = {
    emailConfirmation?: EmailConfirmUserModel,
    passwordConfirmation?: PasswordConfirmUserModel
}

@Injectable()
export class UsersSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}
    async create(login: string, email: string, passwordHash: string, dto?: PayloadType): Promise<UsersSqlType> {
        const query = `insert into "Users" (
            id, login, email, "createdAt", "passwordHash",
            "passwordConfirmationCode", "passwordExpirationDate", "passwordIsConfirmed", 
            "emailConfirmationCode", "emailExpirationDate", "emailIsConfirmed", 
            "isBanned", "banDate", "banReason"
        ) values (
            uuid_generate_v4(), '${login}', '${email}', now(), '${passwordHash}', 
            ${
            dto?.passwordConfirmation ? 
            `'${dto.passwordConfirmation.confirmationCode}', 
             '${dateNullable(dto.passwordConfirmation.expirationDate)}', 
              ${dto.passwordConfirmation.isConfirmed}
            ` : 'NUll, NULL, true'}, 
            ${dto?.emailConfirmation ? 
            `'${dto.emailConfirmation.confirmationCode}', 
             '${dateNullable(dto.emailConfirmation.expirationDate)}', 
              ${dto.emailConfirmation.isConfirmed}
            ` : 'NUll, NULL, true'}, 
            false, NUll, NULL
        ) RETURNING *`;
        const [data]: UsersSqlType[] = await this.dataSource.query(query)
        return data
    }
    async getUserByLoginOrEmail(uniqueField: string): Promise<UsersSqlType> {
        const query = `
                    select u.* from "Users" u 
                    where u.login = $1 or u.email = $1
                    `;
        const [data]: UsersSqlType[] = await this.dataSource.query(query,[uniqueField])
        console.log(data)
        return data
    }
    async getUserByUUIDCode(code: string): Promise<UsersSqlType> {
        const query = `
                    select u.* from "Users" u 
                    where u."emailConfirmationCode" = $1 or u."passwordConfirmationCode" = $1
                    `;
        const [data]: UsersSqlType[] = await this.dataSource.query(query,[code])
        console.log(data)
        return data
    }
    async findById(id: string): Promise<UsersSqlType> {
        const query = `select u.* from "Users" u where u.id = $1;`;
        const [data]: UsersSqlType[] = await this.dataSource.query(query,[id])
        return data
    }
    async updatePassword(payload: PasswordHash, code: string): Promise<boolean> {
        const query = `
            update "Users" u 
            set "passwordHash" = '${payload.passwordHash}'
            where u."passwordConfirmationCode" = $1
        `;
        const data: UpdateResponse<UsersSqlType> = await this.dataSource.query(query,[code])
        return !!data[1]
    }
    async updatePasswordConfirmationData(payload: PasswordConfirmUserModel, email: string): Promise<boolean> {
        const query = `
            update "Users" u 
            set "passwordConfirmationCode" = '${payload.confirmationCode}',
            "passwordExpirationDate" = '${dateNullable(payload.expirationDate)}',
            "passwordIsConfirmed" = '${payload.isConfirmed}'
            where u.email = $1
        `;
        const data: UpdateResponse<UsersSqlType> = await this.dataSource.query(query,[email])
        return !!data[1]
    }
    async updateConfirmation(code: string): Promise<boolean> {
        const query = `
            update "Users" u
            set "emailIsConfirmed" = true
            where u."emailConfirmationCode" = $1
        `;
        const data: UpdateResponse<UsersSqlType> = await this.dataSource.query(query, [code])
        return !!data[1]
    }
    async updateConfirmationData(payload: EmailConfirmUserModel, email: string): Promise<boolean> {
        const query = `
            update "Users" u
            set "emailConfirmationCode" = '${payload.confirmationCode}',
            "emailExpirationDate" = '${dateNullable(payload.expirationDate)}',
            "emailIsConfirmed" = '${payload.isConfirmed}'
            where u.email = '${email}'
        `;
        const data: UpdateResponse<UsersSqlType> = await this.dataSource.query(query)
        return !!data[1]
    }
    async updateBan(payload: BanInputModel, id: string): Promise<boolean> {
        const query = `
            update "Users" u
            set "banDate" = ${payload.isBanned ? 'now()' : 'Null'},
            "banReason" = ${payload.isBanned ? `'${payload.banReason}'` : 'Null'},
            "isBanned" = ${payload.isBanned}
            where u.id = $1
        `;
        const data: UpdateResponse<UsersSqlType> = await this.dataSource.query(query,[id])
        return !!data[1]
    }
    async deleteById(id: string): Promise<boolean> {
        const query = `delete from "Users" where "id" = $1`;
        const data: DeleteResponse<UsersSqlType> = await this.dataSource.query(query,[id])
        return !!data[1]
    }
}