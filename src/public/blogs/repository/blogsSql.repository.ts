import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {Injectable} from "@nestjs/common";
import {BlogsSqlType} from "../../../types/sql/blogs.sql";
import {DataResponse, DeleteResponse} from "../../../types/sql/types";

@Injectable()
export class BlogsSqlRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {}

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
    async checkIncludeUser(userId: string): Promise<boolean>{
        const query = 'select count(*) from "Blogs" where "usersId"=$1'
        const [data] = await this.dataSource.query(query,[userId])
        return !!data.count
    }
}