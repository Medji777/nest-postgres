import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {PaginationService} from "../../../applications/pagination.service";
import {PaginationDto} from "../../../utils/dto/pagination.dto";
import {ArrayDataResponse, ResponseDataCount} from "../../../types/sql/types";
import {CommentSqlModel} from "../../../types/sql/comments.sql";
import {CommentViewModel, PostInfo} from "../../../types/comments";
import {Paginator} from "../../../types/types";

type CommentViewType = CommentViewModel & {postInfo: PostInfo}
type CommentSqlType = CommentSqlModel & {postInfo: PostInfo}

@Injectable()
export class CommentsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private paginationService: PaginationService
    ) {}

    async getAllCommentsWithPostByBlog(queryDto: PaginationDto, userId: string): Promise<Paginator<CommentViewType>> {
        const paginationOptions = this.paginationService.paginationOptions(queryDto)
        const query = `select c.id, c.content, 
                   jsonb_build_object('userId',uc.id,'userLogin',uc.login) as "commentatorInfo",
                   c."createdAt",
                   jsonb_build_object('likesCount',c."likesCount",'dislikesCount',c."dislikesCount",'myStatus', 
                        jsonb_agg(case when ${!!userId} and cl."userId"=${userId} then cl."myStatus" else 'None' end)
                   ) as "likesInfo",
                   jsonb_build_object('id',p.id,'title',p.title,'blogId',p."blogId",'blogName',b.name) as "postInfo"
                   from "Comments" as c
                   left join "CommentsLike" as cl on cl."commentsId" = c.id
                   left join "Users" as uc on uc.id = c."userId"
                   left join "Posts" as p on c."postId" = p.id
                   left join "Blogs" as b on b.id = p."blogId"
                   where c."bloggerId"=$1 
                   and uc."isBanned"=false
                   group by c.id, c.content, c."createdAt", c."userId", uc.login
                   ${paginationOptions}
                   `;
        const queryCount = `
            select count(*) from "Comments" as c 
            left join "Users" as uc on uc.id = c."userId"
            where c."bloggerId"=$1 and uc."isBanned"=false
        `;
        const dataArray: ArrayDataResponse<CommentSqlType> = await this.dataSource.query(query, [userId]);
        const [data]: ResponseDataCount = await this.dataSource.query(queryCount,[userId]);

        return this.paginationService.transformPagination({
            doc: dataArray.map(this.getCommentsSqlMapped),
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            count: +data.count
        })
    }

    private getCommentsSqlMapped(model: CommentSqlType): CommentViewType {
        return {
            id: model.id,
            content: model.content,
            commentatorInfo: model.commentatorInfo,
            createdAt: model.createdAt.toISOString(),
            likesInfo: model.likesInfo,
            postInfo: model.postInfo
        }
    }
}