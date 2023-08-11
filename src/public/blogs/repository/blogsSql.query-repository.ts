import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {Injectable, NotFoundException} from "@nestjs/common";
import {PaginationService} from "../../../applications/pagination.service";
import {QueryBlogsDTO} from "../dto";
import {Paginator} from "../../../types/types";
import {BlogsViewModel} from "../../../types/blogs";
import {BlogsSqlType} from "../../../types/sql/blogs.sql";
import {ArrayDataResponse} from "../../../types/sql/types";

@Injectable()
export class BlogsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly paginationService: PaginationService,
    ) {}

    async getAll(queryDTO: QueryBlogsDTO, userId?: string): Promise<Paginator<BlogsViewModel>> {
        const { searchNameTerm, ...restQuery } = queryDTO;

        const paginateOptions = this.paginationService.paginationOptions(restQuery);
        let filterOptions = `name ILIKE $1`;

        if(userId) {
            filterOptions = filterOptions + ` and "userId"=${userId}`;
        }

        const query = `select * from "Blogs" where ${filterOptions} ${paginateOptions}`;
        const queryCount = `select count(*) from "Blogs" where ${filterOptions}`;

        const dataArray: ArrayDataResponse<BlogsSqlType> = await this.dataSource.query(query,[`%${searchNameTerm}%`])
        const [data] = await this.dataSource.query(queryCount, [`%${searchNameTerm}%`])

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getBlogsSqlMapped),
            count: +data.count,
            pageSize: restQuery.pageSize,
            pageNumber: restQuery.pageNumber
        })
    }

    async findById(id: string): Promise<BlogsViewModel> {
        const query = `
            select * from "Blogs" b 
            inner join "Users" as u on u.id=b."userId"
            where id=$1 and u."isBanned"=false or b."isBanned"=false
        `;
        const [data] = await this.dataSource.query(query,[id])
        if (!data) {
            throw new NotFoundException('blog not found');
        }
        return this.getBlogsSqlMapped(data)
    }

    private getBlogsSqlMapped(blog: BlogsSqlType): BlogsViewModel {
        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership
        }
    }
}