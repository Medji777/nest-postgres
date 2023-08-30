import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {Injectable} from "@nestjs/common";
import {PostsSqlType} from "../../../types/sql/posts.sql";
import {DataResponse, DeleteResponse, UpdateResponse} from "../../../types/sql/types";
import {PostInputModel} from "../../../types/posts";

@Injectable()
export class PostsSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async create(
        title: string, 
        shortDescription: string, 
        content: string, 
        blogId: string, 
        postOwnerId: string
    ): Promise<PostsSqlType> {
        const query = `
            insert into "Posts" (id,title,"shortDescription",content,"blogId","createdAt","postOwnerId") values (
            uuid_generate_v4(), '${title}', '${shortDescription}', '${content}', '${blogId}', now(), '${postOwnerId}'
            ) RETURNING *
        `;
        const [data]: DataResponse<PostsSqlType> = await this.dataSource.query(query)
        return data
    }

    async findById(id: string): Promise<PostsSqlType> {
        const [data]: DataResponse<PostsSqlType> =
            await this.dataSource.query(`select * from "Posts" as p where p.id=$1;`,[id]);
        return data
    }

    async findByIdAndBlogId(id: string, blogId: string): Promise<PostsSqlType> {
        const [data]: DataResponse<PostsSqlType> = await this.dataSource.query(
            `select * from "Posts" as p where p.id=$1 and p."blogId"=$2`
            ,[id, blogId]
        )
        return data
    }

    async update(postId: string, payload: PostInputModel): Promise<boolean> {
        const res: UpdateResponse<PostsSqlType> = await this.dataSource.query(
            `update "Posts"
                   set title=$1, "shortDescription"=$2, content=$3, "blogId"=$4 
                   where id=$5`,
            [payload.title,payload.shortDescription,payload.content,payload.blogId,postId]
        );
        return !!res[1]
    }

    async updateCountLikes(): Promise<boolean> {
        const query = this.queryUpdateCountLikes();
        const res: UpdateResponse<PostsSqlType> = await this.dataSource.query(query)
        return !!res[1]
    }

    async updateCountLikesInPost(postId: string): Promise<boolean> {
        const query = this.queryUpdateCountLikes(postId)
        const res: UpdateResponse<PostsSqlType> = await this.dataSource.query(query,[postId])
        return !!res[1]
    }

    async deleteOne(id: string): Promise<boolean> {
        const res: DeleteResponse<PostsSqlType> = await this.dataSource.query(`
            delete from "Posts" as p where p.id = $1
        `,[id])
        return !!res[1]
    }

    private queryUpdateCountLikes(postId?: string): string {
        const filter = postId ? 'and p.id = $1' : ''
        return `
            with like_agg as (
                select p.id as "postId",
                count(case when pl."myStatus" = 'Like' and u."isBanned"=false then 1 else NULL end) as "likesCount",
                count(case when pl."myStatus" = 'Dislike' and u."isBanned"=false then 1 else NULL end) as "dislikesCount"
                from "Posts" as p
                left join "PostsLike" pl on p.id = pl."postId"
                left join "Users" u on u.id = pl."userId"
                where p.id = pl."postId" ${filter}
                group by p.id
            )
            update "Posts" as p 
            set "likesCount"= like_agg."likesCount", 
            "dislikesCount"= like_agg."dislikesCount"
            from "Users" as u, "Blogs" as b, like_agg 
            where p.id = like_agg."postId"
            ${filter}
            and p."blogId" = b.id
            and b."userId" = u.id
            and u."isBanned"=false
            and b."isBanned"=false  
        `
    }
}