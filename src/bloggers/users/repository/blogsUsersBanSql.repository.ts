import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {DataResponse} from "../../../types/sql/types";
import {BlogsUsersBanSql} from "../../../types/sql/blogsUsersBan.sql";

@Injectable()
export class BlogsUsersBanSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async updateBloggerBan(userId: string, blogId: string, banReason: string, isBanned: boolean): Promise<void> {
        const queryBan = `select * from "UsersBlogsBan" where "userId"=$1 and "blogId"=$2`
        const banRecords = await this.dataSource.query(queryBan,[userId,blogId]);

        if(!!banRecords.length && isBanned) {
            const query = `
                    update "UsersBlogsBan" 
                    set "banDate"=now(), "banReason"=$3 
                    where "userId"=$1 and "blogId"=$2
                 `;
            await this.dataSource.query(query,[userId,blogId,banReason])
        }

        if(!!banRecords.length && !isBanned) {
            const query = `delete from "UsersBlogsBan" where "userId"=$1 and "blogId"=$2`;
            await this.dataSource.query(query, [userId,blogId])
        }

        if(!banRecords.length && isBanned) {
            const query = `
                    insert into "UsersBlogsBan" ("userId","blogId","banDate","banReason") 
                    values ($1,$2,now(),$3)`;
            await this.dataSource.query(query,[userId,blogId,banReason])
        }
    }

    async checkBanStatusForBlog(userId: string, blogId: string): Promise<boolean> {
        const [data]: DataResponse<BlogsUsersBanSql> = await this.dataSource.query(`
            select ub."userId" from "UsersBlogsBan" as ub where ub."userId"=$1 and ub."blogId"=$2
        `,[userId,blogId])
        return !!data
    }

    async checkBannedUserByPostId(userId: string, postId: string): Promise<boolean> {
        const [data] = await this.dataSource.query(
            `select p.id from "Posts" as p 
             left join "Blogs" b on p."blogId"=b.id
             left join "UsersBlogsBan" ub on b.id=ub."blogId"
             where ub."blogId"=b.id and ub."userId"=$1 and p.id=$2;`,
            [userId,postId]
        );
        return !!data;
    }
}