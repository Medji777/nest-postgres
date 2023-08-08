import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {DataResponse, UpdateResponse} from "../../../types/sql/types";
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
            insert into (id,content,"userId","createdAt","postId","bloggerId") values (
            uuid_generate_v4(),${content},${userId},now(),${postId},${bloggerId}
            ) returning *
        `;
        const [data]: DataResponse<CommentsSqlType> = await this.dataSource.query(query)
        return data
    }

    async updateCountLikes(userId: string): Promise<boolean> {
        const query = `
            with likes_agg as (
                select count(case when cl."myStatus" = 'Like' and u."isBanned"=false then 1 else NULL end) as "likesCount",
                count(case when cl."myStatus" = 'Dislike' and u."isBanned"=false then 1 else NULL end) as "dislikesCount"
                from "Comments" as c
                left join "CommentsLike" cl on cl."userId"=$1
                left join "Users" u on u.id = $1
                where c.id = cl."commentId" 
            )
            update "Comments" as c
            set "likesCount"= likes_agg."likesCount", 
            "dislikesCount"= likes_agg."dislikesCount"
            from "CommentsLike" as cl, "Users" as u, likes_agg
            where 
            cl."userId" = $1 and u.id = $1 and c.id = cl."commentId" and u."isBanned"=false
        `;
        const res: UpdateResponse<CommentsSqlType> = await this.dataSource.query(query, [userId])
        return !!res[1]
    }
}