import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {QueryBlogsDTO} from "../../../public/blogs/dto";
import {Paginator} from "../../../types/types";
import {BanInfo, BlogOwnerInfo, BlogsSAViewModel} from "../../../types/blogs";
import {PaginationService} from "../../../applications/pagination.service";
import {ArrayDataResponse, ResponseDataCount} from "../../../types/sql/types";
import {BlogsSqlType} from "../../../types/sql/blogs.sql";

type BlogsSAViewSqlModel = BlogsSqlType & {
    blogOwnerInfo: BlogOwnerInfo,
    banInfo: BanInfo
}

@Injectable()
export class BlogsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly paginationService: PaginationService
    ) {}

    async getAll(queryDto: QueryBlogsDTO): Promise<Paginator<BlogsSAViewModel>> {
        const {searchNameTerm, ...restQuery} = queryDto;
        const paginateOptions = this.paginationService.paginationOptions(restQuery)
        const filterOptions = 'name ILIKE $1'
        const dataArray: ArrayDataResponse<BlogsSAViewSqlModel> = await this.dataSource.query(
            `select b.id, b.name, b.description, 
                   b."websiteUrl", b."createdAt", b."isMembership",
                   jsonb_create_object('userId',b."userId",'userLogin',u.login) as "blogOwnerInfo",
                   jsonb_create_object('isBanned',b."isBanned",'banDate',b."banDate") as "banInfo" from "Blogs" as b 
                   inner join "Users" as u on u.id = b."userId"
                   where ${filterOptions} ${paginateOptions};`,
            [`%${searchNameTerm}%`]
        )
        const [data]: ResponseDataCount = await this.dataSource.query(
            `select count(*) from "Blogs" where ${filterOptions}`,
            [`%${searchNameTerm}%`]
        )

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getMapped),
            pageSize: restQuery.pageSize,
            pageNumber: restQuery.pageNumber,
            count: +data.count
        })
    }

    private getMapped(model: BlogsSAViewSqlModel): BlogsSAViewModel {
        return {
            id: model.id,
            name: model.name,
            description: model.description,
            websiteUrl: model.websiteUrl,
            createdAt: model.createdAt.toISOString(),
            isMembership: model.isMembership,
            blogOwnerInfo: model.blogOwnerInfo,
            banInfo: model.banInfo
        }
    }
}