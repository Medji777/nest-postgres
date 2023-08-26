import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {Injectable} from "@nestjs/common";
import {PostsSqlType} from "../../../types/sql/posts.sql";
import {DataResponse, DeleteResponse, UpdateResponse} from "../../../types/sql/types";
import {LikeInfoModel} from "../../../types/likes";
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

    async updateCountLikes(userId: string): Promise<boolean> {
        const query = `
            with likes_agg as (
                select count(case when pl."myStatus" = 'Like' and u."isBanned"=false then 1 else NULL end) as "likesCount",
                count(case when pl."myStatus" = 'Dislike' and u."isBanned"=false then 1 else NULL end) as "dislikesCount"
                from "Posts" as p
                left join "PostsLike" pl on pl."userId"=$1
                left join "Users" u on u.id = pl."userId"
                where p.id = pl."postId" 
            )
            update "Posts" as p
            set "likesCount"= likes_agg."likesCount", 
            "dislikesCount"= likes_agg."dislikesCount"
            from "PostsLike" as pl, "Users" as u, "Blogs" as b, likes_agg
            where pl."userId"= $1
            and u.id = pl."userId"
            and p.id = pl."postId"
            and p."blogId" = b.id
            and b."isBanned"=false    
        `;
        const res: UpdateResponse<PostsSqlType> = await this.dataSource.query(query,[userId])
        return !!res[1]
    }

    async updateCountLikesInPosts(postId: string, likeInfo: LikeInfoModel): Promise<boolean> {
        const res = await this.dataSource.query(`
            update "Posts" as p 
            set "likesCount"= $2, "dislikesCount"= $3
            where p.id = $1
        `,[postId,likeInfo.likesCount,likeInfo.dislikesCount])
        return !!res[1]
    }

    async updateCountLikesInPost(postId: string, userId: string): Promise<boolean> {
        const res = await this.dataSource.query(`
            with like_agg as (
                select count(case when pl."myStatus" = 'Like' and u."isBanned"=false then 1 else NULL end) as "likesCount",
                count(case when pl."myStatus" = 'Dislike' and u."isBanned"=false then 1 else NULL end) as "dislikesCount"
                from "Posts" as p
                left join "PostsLike" pl on pl."userId"=$1
                left join "Users" u on u.id = $1
                where p.id = pl."postId" and p.id = $2
            )
            update "Posts" as p 
            set "likesCount"= like_agg."likesCount", 
            "dislikesCount"= like_agg."dislikesCount"
            from "PostsLike" as pl, "Users" as u, "Blogs" as b, like_agg 
            where pl."userId" = $1 
            and p.id = $2 
            and p.id = pl."postId"
            and p."blogId" = b.id
            and u."isBanned"=false
            and b."isBanned"=false  
        `,[userId,postId])
        return !!res[1]
    }

    async deleteOne(id: string): Promise<boolean> {
        const res: DeleteResponse<PostsSqlType> = await this.dataSource.query(`
            delete from "Posts" as p where p.id = $1
        `,[id])
        return !!res[1]
    }

    async deleteAll(): Promise<void> {
        await this.dataSource.query(`TRUNCATE "Posts" CASCADE`);
    }
}