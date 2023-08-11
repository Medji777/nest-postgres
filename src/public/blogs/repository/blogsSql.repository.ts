import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {Injectable} from "@nestjs/common";
import {BlogsSqlType} from "../../../types/sql/blogs.sql";
import {DataResponse, DeleteResponse, UpdateResponse} from "../../../types/sql/types";
import {BlogsInputModelDTO} from "../dto";

@Injectable()
export class BlogsSqlRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}
    async create(name: string, description: string, websiteUrl: string, userId: string ): Promise<BlogsSqlType> {
        const query = `
            insert into "Blogs" (
                id,name,description,"websiteUrl","createdAt",
                "isMembership","banDate","isBanned","userId"
            ) values (
                uuid_generate_v4(), '${name}', '${description}', '${websiteUrl}', now(), 
                false, NULL, false, '${userId}'
            ) RETURNING *
        `;
        const [data]: DataResponse<BlogsSqlType> = await this.dataSource.query(query);
        return data
    }
    async findById(id: string): Promise<BlogsSqlType | null> {
        const query = `select * from "Blogs" where id=$1`;
        const [data]: DataResponse<BlogsSqlType> = await this.dataSource.query(query,[id]);
        return data
    }
    async deleteById(id: string): Promise<boolean> {
        const query = `delete from "Blogs" where id=$1`;
        const res: DeleteResponse<BlogsSqlType> = await this.dataSource.query(query,[id]);
        return !!res[1]
    }
    async checkIncludeUser(userId: string): Promise<boolean> {
        const query = 'select count(*) from "Blogs" where "usersId"=$1'
        const [data] = await this.dataSource.query(query,[userId])
        return !!data.count
    }
    async update(blogId: string, payload: BlogsInputModelDTO) {
        const res: UpdateResponse<BlogsSqlType> = await this.dataSource.query(
            `update "Blogs" as b 
                   set b.name = $1, 
                   b.description = $2, 
                   b."websiteUrl" = $3
                   where b."blogId" = $4;`,
            [payload.name, payload.description, payload.websiteUrl, blogId]
        )
        return !!res[1]
    }
    async updateBindUser(blogId: string, userId: string): Promise<boolean> {
        const res: UpdateResponse<BlogsSqlType> = await this.dataSource.query(
            `update "Blogs" set "userId"=$1 where id=$2`,
            [userId,blogId]
        )
        return !!res[1]
    }
    async updateBan(blogId: string, isBanned: boolean): Promise<boolean> {
        const banDate = !isBanned ? 'Null' : 'now()'
        const res: UpdateResponse<BlogsSqlType> = await this.dataSource.query(
            `update "Blogs" as b set "banDate"=${banDate}, "isBanned" = $2 where id = $1`,
            [blogId,isBanned]
        )
        return !!res[1]
    }
}