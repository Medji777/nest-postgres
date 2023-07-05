import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Blogs, BlogsModelType} from "../../../public/blogs/entity/blogs.schema";
import {PaginationService} from "../../../applications/pagination.service";
import {QueryBlogsDTO} from "../../../public/blogs/dto";
import {BlogsSAViewModel} from "../../../types/blogs";
import {Paginator} from "../../../types/types";

const projection = { _id: 0, __v: 0, "blogOwnerInfo.isBanned": 0 };

@Injectable()
export class BlogsQueryRepository {
    constructor(
        @InjectModel(Blogs.name) private BlogsModel: BlogsModelType,
        private readonly paginationService: PaginationService,
    ) {}
    async getAll(query: QueryBlogsDTO): Promise<Paginator<BlogsSAViewModel>> {
        const { searchNameTerm, ...restQuery } = query;
        let filter = {};
        if(searchNameTerm) {
            filter = { name: { $regex: new RegExp(searchNameTerm, 'gi') } }
        }

        const pagination = await this.paginationService.create<BlogsModelType,Array<BlogsModelType>>(
            restQuery,
            this.BlogsModel,
            projection,
            filter,
            true
        );
        return this.paginationService.transformPagination<BlogsSAViewModel,Array<BlogsModelType>>(pagination);
    }
}