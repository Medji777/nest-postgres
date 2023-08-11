import {Injectable} from "@nestjs/common";
import {UserViewModelSA} from "../../types/users";
import {UsersSqlType} from "../../types/sql/user.sql";

@Injectable()
export class UsersService {
    createUserSqlMapped(model: UsersSqlType): UserViewModelSA {
        return {
            id: model.id,
            login: model.login,
            email: model.email,
            createdAt: model.createdAt.toISOString(),
            banInfo: {
                isBanned: model.isBanned,
                banDate: !model.banDate ? model.banDate : model.banDate.toISOString(),
                banReason: model.banReason
            }
        };
    }
}