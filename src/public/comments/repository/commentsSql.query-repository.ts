import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {PaginationService} from "../../../applications/pagination.service";
import {CommentViewModel} from "../../../types/comments";
import {ArrayDataResponse, DataResponse, ResponseDataCount} from "../../../types/sql/types";
import {QueryCommentsDto} from "../dto";
import {Paginator} from "../../../types/types";
import {CommentSqlModel} from "../../../types/sql/comments.sql";

@Injectable()
export class CommentsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dateSource: DataSource,
        private readonly paginationService: PaginationService,
    ) {}

    async findById(id: string, userId?: string): Promise<CommentViewModel> {
        const query = `
            select c.id, c.content, 
            jsonb_build_object('userId',c."userId",'userLogin',u.login) as "commentatorInfo", 
            c."createdAt", 
            jsonb_build_object('likesCount',c."likesCount",'dislikesCount',c."dislikesCount",'myStatus', 
                jsonb_agg(case when ${!!userId} and cl."userId"=${userId} then cl."myStatus" else 'None' end)
            ) as "likesInfo"
            from "Comments" as c 
            left join "Users" as u on u.id = c."userId"
            left join "CommentsLike" as cl on cl."commentsId" = c.id
            where c.id = $1 and u."isBanned"=false
            group by c.id, c.content, c."createdAt", c."userId", u.login;
        `;
        const [data]: DataResponse<CommentSqlModel> = await this.dateSource.query(query,[id])
        if(!data) throw new NotFoundException()
        return this.getCommentsSqlMapped(data)
    }

    async getCommentsByPostId(
        id: string,
        queryDto: QueryCommentsDto,
        userId?: string,
    ): Promise<Paginator<CommentViewModel>> {
        const [post] = await this.dateSource.query(`
            select count(p.id) from "Posts" as p where p.id = $1
        `,[id])
        if(!post) throw new NotFoundException();

        const paginationOptions = this.paginationService.paginationOptions(queryDto)
        const query = `
            select c.id, c.content, 
            jsonb_build_object('userId',c."userId",'userLogin',u.login) as "commentatorInfo", 
            c."createdAt", 
            jsonb_build_object('likesCount',c."likesCount",'dislikesCount',c."dislikesCount",'myStatus', 
                jsonb_agg(case when ${!!userId} and cl."userId"=${userId} then cl."myStatus" else 'None' end)
            ) as "likesInfo"
            from "Comments" as c 
            left join "Users" as u on u.id = c."userId"
            left join "CommentsLike" as cl on cl."commentsId" = c.id
            where c."postId" = $1 and u."isBanned"=false
            group by c.id, c.content, c."createdAt", c."userId", u.login
            ${paginationOptions}
        `;
        const queryCount = `
            select count(*) from "Comments" as c 
            left join "Users" as u on c."userId" = u.id
            where c."postId" = $1 and u."isBanned"=false
        `;
        const dataArray: ArrayDataResponse<CommentSqlModel> = await this.dateSource.query(query,[id]);
        const [data]: ResponseDataCount = await this.dateSource.query(queryCount);
        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getCommentsSqlMapped),
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            count: +data.count
        })
    }

    private getCommentsSqlMapped(model: CommentSqlModel): CommentViewModel {
        return {
            id: model.id,
            content: model.content,
            commentatorInfo: model.commentatorInfo,
            createdAt: model.createdAt.toISOString(),
            likesInfo: model.likesInfo
        }
    }
}