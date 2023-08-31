import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {PaginationService} from "../../../applications/pagination.service";
import {CommentViewModel} from "../../../types/comments";
import {ArrayDataResponse, DataResponse, ResponseDataCount} from "../../../types/sql/types";
import {QueryCommentsDto} from "../dto";
import {LikeStatus, Paginator} from "../../../types/types";
import {CommentSqlModel} from "../../../types/sql/comments.sql";

type CommentsSqlModelType = CommentSqlModel & {likeStatus: number, dislikeStatus: number}

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
            ${this.getUserStatus(userId)}
            jsonb_build_object('likesCount',c."likesCount",'dislikesCount',c."dislikesCount") as "likesInfo"
            from "Comments" as c 
            inner join "Users" as u on u.id = c."userId"
            left join "CommentsLike" as cl on cl."commentId" = c.id
            where c.id = $1 and u."isBanned"=false
            group by c.id, c.content, c."createdAt", c."userId", u.login;
        `;
        const [data]: DataResponse<CommentsSqlModelType> = await this.dateSource.query(query,[id])
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
        if(!+post.count) throw new NotFoundException();

        const paginationOptions = this.paginationService.paginationOptions(queryDto)
        const query = `
            select c.id, c.content, 
            jsonb_build_object('userId',c."userId",'userLogin',u.login) as "commentatorInfo", 
            c."createdAt", 
            ${this.getUserStatus(userId)}
            jsonb_build_object('likesCount',c."likesCount",'dislikesCount',c."dislikesCount") as "likesInfo"
            from "Comments" as c 
            left join "Users" as u on u.id = c."userId"
            left join "CommentsLike" as cl on cl."commentId" = c.id
            where c."postId" = $1 and u."isBanned"=false
            group by c.id, c.content, c."createdAt", c."userId", u.login
            ${paginationOptions}
        `;
        const queryCount = `
            select count(c.id) from "Comments" as c 
            left join "Users" as u on c."userId" = u.id
            where c."postId" = $1 and u."isBanned"=false
        `;
        const dataArray: ArrayDataResponse<CommentsSqlModelType> = await this.dateSource.query(query,[id]);
        const [data]: ResponseDataCount = await this.dateSource.query(queryCount,[id]);
        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getCommentsSqlMapped),
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            count: +data.count
        })
    }

    private getCommentsSqlMapped(model: CommentSqlModel & {likeStatus: number, dislikeStatus: number}): CommentViewModel {
        const myStatus = model.likeStatus ? LikeStatus.Like : model.dislikeStatus ? LikeStatus.Dislike : LikeStatus.None;
        return {
            id: model.id,
            content: model.content,
            commentatorInfo: model.commentatorInfo,
            createdAt: model.createdAt.toISOString(),
            likesInfo: {
                ...model.likesInfo,
                myStatus: myStatus
            }
        }
    }
    private getUserStatus(userId: string): string {
        if (userId) {
            return `
              count(case 
                    when cl."userId"='${userId} and cl."myStatus"='${LikeStatus.Like}' 
                        then 1 else NULL 
                    end )::int as "likeStatus",
              count(case 
                    when cl."userId"='${userId} and cl."myStatus"='${LikeStatus.Dislike}' 
                        then 1 else NULL 
                    end )::int as "dislikeStatus",`;
        }
        return '';
    }
}