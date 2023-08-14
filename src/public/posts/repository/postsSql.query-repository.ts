import {Injectable, NotFoundException} from "@nestjs/common";
import {QueryPostsDto} from "../dto";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {LikeStatus, Paginator} from "../../../types/types";
import {PostsViewModel} from "../../../types/posts";
import {PaginationService} from "../../../applications/pagination.service";
import {ArrayDataResponse, DataResponse, ResponseDataCount} from "../../../types/sql/types";
import {PostsSqlFilterType} from "../../../types/sql/posts.sql";

@Injectable()
export class PostsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private paginationService: PaginationService
    ) {}
    async getAll(queryDTO: QueryPostsDto, userId?: string): Promise<Paginator<PostsViewModel>> {

        const paginateOptions = this.paginationService.paginationOptions(queryDTO)

        const query = `
            select p.id, 
                p.title, 
                p."shortDescription", 
                p.content, 
                p."blogId", 
                b.name AS "blogName",
                p."createdAt",
                p."likesCount",
                p."dislikesCount"
                
                (case when ${!!userId} and pl."userId"=${userId} then pl."myStatus" else 'None' end) as "myStatus"
                
                array_to_json(ARRAY(
                         select u.login, u.id as "userId", pl2."addedAt"
                         from "PostsLike" as pl2
                         inner join "Users" u ON pl2."userId" = u.id
                         where pl2."postId" = p.id and pl2."myStatus" = 'Like' and u."isBanned"=false
                         order by pl2."addedAt" desc
                         limit 3
                )) AS "lastLikesUser"
                 
                from "Posts" as p 
                
                left join "PostsLike" as pl on p.id = pl."postId"
                left join "Blogs" as b on p."blogId" = b.id
                left join "Users" as u on b."userId"=u.id
                
                where b."isBanned"=false and u."isBanned"=false
                
                GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name
                ${paginateOptions}
        `;

        const queryCount = `
                        select count(p.*)
                        from "Posts" as p
                        left join "Blogs" as b on p."blogId" = b.id
                        left join "Users" as u on b."userId"=u.id
                        where b."isBanned"=false and u."isBanned"=false
        `;

        const dataArray: ArrayDataResponse<PostsSqlFilterType> = await this.dataSource.query(query)
        const [data]: ResponseDataCount = await this.dataSource.query(queryCount)

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getOutputPostSqlMapped),
            count: +data.count,
            pageSize: queryDTO.pageSize,
            pageNumber: queryDTO.pageNumber
        })
    }

    async findById(id: string, userId?: string): Promise<PostsViewModel>  {
        const query = `
            select p.id, 
                p.title, 
                p."shortDescription", 
                p.content, 
                p."blogId", 
                b.name AS "blogName",
                p."createdAt",
                p."likesCount",
                p."dislikesCount"
                
                (case when ${!!userId} and pl."userId"=${userId} then pl."myStatus" else 'None' end) as "myStatus"
                
                array_to_json(ARRAY(
                         select u.login, u.id as "userId", pl2."addedAt"
                         from "PostsLike" as pl2
                         inner join "Users" u ON pl2."userId" = u.id
                         where pl2."postId" = p.id and pl2."myStatus" = 'Like' and u."isBanned"=false
                         order by pl2."addedAt" desc
                         limit 3
                )) AS "lastLikesUser"
                 
                from "Posts" as p 
                
                left join "PostsLike" as pl on p.id = pl."postId"
                left join "Blogs" as b on p."blogId" = b.id
                left join "Users" as u on b."userId"=u.id
                
                where b."isBanned"=false and u."isBanned"=false and p.id=$1
                
                GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name
        `;
        const [data]: DataResponse<PostsSqlFilterType> = await this.dataSource.query(query,[id])
        if(!data) throw new NotFoundException()
        return this.getOutputPostSqlMapped(data)
    }

    async getPostsByBlogId(
        blogId: string,
        queryDTO: QueryPostsDto,
        userId?: string
    ): Promise<Paginator<PostsViewModel>> {
        const paginateOptions = this.paginationService.paginationOptions(queryDTO)
        const query = `
            select p.id, 
                p.title, 
                p."shortDescription", 
                p.content, 
                p."blogId", 
                b.name AS "blogName",
                p."createdAt",
                p."likesCount",
                p."dislikesCount"
                
                (case when ${!!userId} and pl."userId"=${userId} then pl."myStatus" else 'None' end) as "myStatus"
                
                array_to_json(ARRAY(
                         select u.login, u.id as "userId", pl2."addedAt"
                         from "PostsLike" as pl2
                         inner join "Users" u ON pl2."userId" = u.id
                         where pl2."postId" = p.id and pl2."myStatus" = 'Like' and u."isBanned"=false
                         order by pl2."addedAt" desc
                         limit 3
                )) AS "lastLikesUser"
                
                from "Posts" as p
                
                left join "PostsLike" as pl on p.id = pl."postId"
                left join "Blogs" as b on p."blogId" = b.id
                left join "Users" as u on b."userId"=u.id
                
                where b."isBanned"=false and u."isBanned"=false and p."blogId"=$1
                
                GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name
                ${paginateOptions}
        `;
        const queryCount = `
                        select count(p.*)
                        from "Posts" as p
                        left join "Blogs" as b on p."blogId" = b.id
                        left join "Users" as u on b."userId"=u.id
                        where b."isBanned"=false and u."isBanned"=false and p."blogId"=$1
        `;
        const dataArray: ArrayDataResponse<PostsSqlFilterType> = await this.dataSource.query(query,[blogId])
        const [data]: ResponseDataCount = await this.dataSource.query(queryCount)

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getOutputPostSqlMapped),
            count: +data.count,
            pageSize: queryDTO.pageSize,
            pageNumber: queryDTO.pageNumber
        })
    }

    private getOutputPostSqlMapped(post: PostsSqlFilterType): PostsViewModel {
        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                myStatus: LikeStatus.None,
                newestLikes: post.lastLikesUser,
            },
        };
    }
}