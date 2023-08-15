import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";
import {LikeStatus} from "../../../../types/types";
import {CommentsLikeSql} from "../../../../types/sql/commentsLike.sql";
import {DataResponse, UpdateResponse} from "../../../../types/sql/types";

@Injectable()
export class CommentsLikeSqlRepository {
    constructor(private readonly dataSource: DataSource) {}

    async create(
        userId,
        commentId,
        myStatus: LikeStatus,
    ): Promise<CommentsLikeSql> {
        const [data]: DataResponse<CommentsLikeSql> = await this.dataSource.query(
            `insert into "CommentsLike" ("userId","commentId","myStatus") values ($1,$2,$3) returning *`,
            [userId,commentId,myStatus]
        )
        return data
    }

    async findByUserIdAndCommentId(
        userId: string,
        commentId: string
    ): Promise<CommentsLikeSql> {
        const [data]: DataResponse<CommentsLikeSql> = await this.dataSource.query(
            `select * from "CommentsLike" as cl where cl."userId"=$1 and cl."commentId"=$3`,
            [userId, commentId]
        )
        return data
    }

    async updateStatus(id: string, myStatus: LikeStatus): Promise<boolean> {
        const res: UpdateResponse<CommentsLikeSql> = await this.dataSource.query(
            `update "CommentsLike" set "myStatus"=$2 where "commentId"=$1`,
            [id, myStatus]
        )
        return !!res[1]
    }
}