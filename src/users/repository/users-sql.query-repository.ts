import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QueryUsersDto} from "../dto";
import {BanStatus, Paginator} from "../../types/types";
import {PaginationService} from "../../applications/pagination.service";
import {UsersSqlType} from "../../types/sql/user.sql";
import {UserViewModelSA} from "../../types/users";

@Injectable()
export class UsersSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly paginationService: PaginationService,
    ) {}
    async getAll(queryDTO: QueryUsersDto): Promise<Paginator<UserViewModelSA>> {
        const {searchLoginTerm, searchEmailTerm, banStatus, ...restQuery} = queryDTO;
        const banFilter = this.getBanStatus(banStatus);
        const paginateOptions = `
                ORDER BY "${restQuery.sortBy}" ${restQuery.sortDirection}
                LIMIT ${restQuery.pageSize}
                offset ${(restQuery.pageNumber - 1) * restQuery.pageSize}
        `;
        const filterOptions = `
                ${banFilter}
                (login ILIKE $1 or email ILIKE $2)
        `;
        const query = `select * from "Users" where ${filterOptions} ${paginateOptions};`;
        const queryCount = `select count(*) from "Users" where ${filterOptions};`;

        const dataArray = await this.dataSource.query(query, [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`]);
        const [data] = await this.dataSource.query(queryCount,[`%${searchLoginTerm}%`, `%${searchEmailTerm}%`]);

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getOutputUserSqlMapped),
            count: +data.count,
            pageSize: restQuery.pageSize,
            pageNumber: restQuery.pageNumber
        })
    }
    async getUserByLoginOrEmail(uniqueField: string): Promise<UsersSqlType> {
        const query = `
                    select u.* from "Users" u 
                    where 
                    u.login = '${uniqueField}' or 
                    u.email = '${uniqueField}'
                    `;
        const [data]: UsersSqlType[] = await this.dataSource.query(query)
        return data
    }
    async getIsUniqueUserByLogin(login: string): Promise<boolean> {
        const query = `select login from "Users" u where u.login = $1`;
        const [data]: UsersSqlType[] = await this.dataSource.query(query, [login])
        return !data
    }
    async getIsUniqueUserByEmail(email: string): Promise<boolean> {
        const query = `select email from "Users" u where u.email = $1`;
        const [data]: UsersSqlType[] = await this.dataSource.query(query, [email])
        return !data
    }
    private getOutputUserSqlMapped(user: UsersSqlType): UserViewModelSA {
        return {
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            banInfo: {
                isBanned: user.isBanned,
                banDate: user.banDate ? user.banDate.toISOString() : null,
                banReason: user.banReason
            }
        };
    }
    private getBanStatus(banStatus: BanStatus): string {
        if(banStatus !== BanStatus.all){
            return `"isBanned"=${banStatus} AND`
        }
        return ``
    }
}