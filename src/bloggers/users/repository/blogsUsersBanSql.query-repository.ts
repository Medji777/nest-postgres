import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {QueryUsersDto} from "../dto";
import {ArrayDataResponse, DataResponse} from "../../../types/sql/types";
import {BlogsSqlType} from "../../../types/sql/blogs.sql";
import {PaginationService} from "../../../applications/pagination.service";
import {UsersBloggerViewModel} from "../../../types/users";
import {BlogsUsersBanSql} from "../../../types/sql/blogsUsersBan.sql";
import {Paginator} from "../../../types/types";

type BlogsUsersBan = BlogsUsersBanSql & {login: string}

@Injectable()
export class BlogsUsersBanSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly paginationService: PaginationService
    ) {}

    async getBannedUserByBlogId(
        blogId: string,
        userId: string,
        queryDto: QueryUsersDto
    ): Promise<Paginator<UsersBloggerViewModel>> {
        const [blog]: DataResponse<BlogsSqlType> = await this.dataSource.query(
            `select b.id, b."userId" from "Blogs" as b where b.id=$1`,[blogId]);
        if(!blog) throw new NotFoundException('blog not found');
        if(blog.userId !== userId) throw new ForbiddenException();

        const {searchLoginTerm, ...restQuery} = queryDto;

        const paginateOptions = this.paginationService.paginationOptions(restQuery)

        const filterOptions = `u.login ILIKE $2`

        const query = `
             select ubb."userId", ubb."banDate", ubb."banReason", u.login 
             from "UsersBlogsBan" as ubb  
             inner join "Users" u on u.id = ubb."userId"
             where ubb."blogId"=$1 and u."isBanned"=false and ${filterOptions} ${paginateOptions}
        `;
        const queryCount = `
            select count(ubb."userId") from "UsersBlogsBan" as ubb  
            inner join "Users" u on u.id = ubb."userId"
            where ubb."blogId"=$1 and u."isBanned"=false and ${filterOptions}
        `;
        const dataArray: ArrayDataResponse<BlogsUsersBan> =
            await this.dataSource.query(query,[blogId, `%${searchLoginTerm}%`]);
        const [data] = await this.dataSource.query(queryCount,[blogId, `%${searchLoginTerm}%`]);

        return this.paginationService.transformPagination({
            doc: dataArray.map(this._getOutputBannedUser),
            count: +data.count,
            pageSize: restQuery.pageSize,
            pageNumber: restQuery.pageNumber
        })
    }

    private _getOutputBannedUser(
        data: BlogsUsersBan,
    ): UsersBloggerViewModel {
        return {
            id: data.userId,
            login: data.login,
            banInfo: {
                isBanned: true,
                banDate: data.banDate.toISOString(),
                banReason: data.banReason
            }
        };
    }
}