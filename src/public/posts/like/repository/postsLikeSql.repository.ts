import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {DataResponse, UpdateResponse} from "../../../../types/sql/types";
import {PostsLikeSql} from "../../../../types/sql/postsLike.sql";
import {LikeStatus} from "../../../../types/types";

@Injectable()
export class PostsLikeSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async create(
        userId: string,
        postId: string,
        likeStatus: LikeStatus
    ): Promise<PostsLikeSql> {
        const query = `
                    insert into "PostsLike" ("userId","postId","myStatus","addedAt","isBanned") 
                    values ($1,$2,$3,now(),false)
                    returning *
              `;
        const [data]: DataResponse<PostsLikeSql> =
            await this.dataSource.query(query,[userId,postId,likeStatus]);
        return data
    }

    async findByUserIdAndPostId(userId: string, postId: string): Promise<PostsLikeSql> {
        const [data]: DataResponse<PostsLikeSql> = await this.dataSource.query(
            `select * from "PostsLike" as pl where pl."userId"=$1 and pl."postId"=$2`,
            [userId,postId]
        )
        return data
    }

    async updateStatus(userId: string, postId: string, status: LikeStatus): Promise<boolean> {
        const res: UpdateResponse<PostsLikeSql> = await this.dataSource.query(`
            update "PostsLike" as pl
            set "myStatus" = $3
            where pl."userId" = $1 and pl."postId" = $2
        `,[userId,postId,status])
        return !!res[1]
    }

    async deleteAll(): Promise<void> {
        await this.dataSource.query(`TRUNCATE "PostsLike" CASCADE`);
    }
}