import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {DataResponse, DeleteResponse, UpdateResponse} from "../../../types/sql/types";
import {CommentsSqlType} from "../../../types/sql/comments.sql";

@Injectable()
export class CommentsSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async create(
        content: string,
        postId: string,
        userId: string,
        bloggerId: string
    ): Promise<CommentsSqlType> {
        const query = `
            insert into "Comments" (id,content,"userId","createdAt","postId","bloggerId") values (
            uuid_generate_v4(),'${content}','${userId}',now(),'${postId}','${bloggerId}'
            ) returning *
        `;
        const [data]: DataResponse<CommentsSqlType> = await this.dataSource.query(query)
        return data
    }

    async findById(id: string): Promise<CommentsSqlType> {
        const [data]: DataResponse<CommentsSqlType> = await this.dataSource.query(
            `select c.* from "Comments" as c 
                   inner join "Users" as u on u.id = c."userId"
                   where u."isBanned"=false and c.id=$1`,
            [id]
        )
        return data
    }

    async update(id: string, content: string): Promise<boolean> {
        const res: UpdateResponse<CommentsSqlType> = await this.dataSource.query(
            `update "Comments" set content=$1 where id=$2`,
            [content,id]
        )
        return !!res[1]
    }

    async updateCountLikes(): Promise<boolean> {
        const query = this.queryUpdateCountLikes()
        const res: UpdateResponse<CommentsSqlType> = await this.dataSource.query(query)
        return !!res[1]
    }

    async updateCountLikesByComment(commentId: string): Promise<boolean> {
        const query = this.queryUpdateCountLikes(commentId)
        const res: UpdateResponse<CommentsSqlType> = await this.dataSource.query(query, [commentId])
        return !!res[1]
    }

    async delete(id: string): Promise<boolean> {
        const res: DeleteResponse<CommentsSqlType> = await this.dataSource.query(
            `delete from "Comments" where id=$1`,[id]
        )
        return !!res[1]
    }

    private queryUpdateCountLikes(commentId?: string): string {
        const filter = commentId ? 'and c.id = $1' : ''
        return `
            with likes_agg as (
                select c.id as "commentId",
                count(case when cl."myStatus" = 'Like' and u."isBanned"=false then 1 else NULL end) as "likesCount",
                count(case when cl."myStatus" = 'Dislike' and u."isBanned"=false then 1 else NULL end) as "dislikesCount"
                from "Comments" as c
                left join "CommentsLike" cl on c.id = cl."commentId" 
                left join "Users" u on u.id = cl."userId"
                where c.id = cl."commentId" ${filter}
                group by c.id
            )
            update "Comments" as c
            set "likesCount"= likes_agg."likesCount", 
            "dislikesCount"= likes_agg."dislikesCount"
            from "Users" as u, likes_agg
            where c.id = likes_agg."commentId"
            ${filter}
            and u.id = c."userId" 
            and u."isBanned"=false
        `
    }
}