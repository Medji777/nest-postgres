import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";
import {LikesCommentModel} from "../../../../types/likes";
import {DataResponse} from "../../../../types/sql/types";
import {CommentsLikeSql} from "../../../../types/sql/commentsLike.sql";

@Injectable()
export class CommentsLikeSqlQueryRepository {
    constructor(private readonly dataSource: DataSource) {}

    async getLike(
        userId: string,
        commentId: string,
    ): Promise<LikesCommentModel | null> {
        const [data]: DataResponse<CommentsLikeSql> = await this.dataSource.query(
            `select * from "CommentsLike" as cl where cl."userId"=$1 and cl."commentId"=$2`,
            [userId, commentId]
        )
        if (!data) return null;
        return data;
    }
}