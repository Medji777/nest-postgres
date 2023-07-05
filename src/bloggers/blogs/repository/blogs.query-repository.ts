import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {BlogDocument, Blogs, BlogsModelType} from "../../../public/blogs/entity/blogs.schema";
import {PaginationService} from "../../../applications/pagination.service";
import {QueryBlogsDTO} from "../../../public/blogs/dto";
import {BlogsViewModel} from "../../../types/blogs";

const projection = { _id: 0, __v: 0, blogOwnerInfo: 0, banInfo: 0 };

@Injectable()
export class BlogsQueryRepository {
    constructor(
        @InjectModel(Blogs.name) private BlogsModel: BlogsModelType,
        private paginationService: PaginationService
    ) {}
    async getAllBlogByIdAndUserId(query: QueryBlogsDTO, userId: string) {
        const { searchNameTerm, ...restQuery } = query;
        let filter = {};
        if(searchNameTerm) {
            filter = { name: { $regex: new RegExp(searchNameTerm, 'gi') } }
        }
        if(userId){
            filter = {...filter, "blogOwnerInfo.userId": userId}
        }
        const pagination = await this.paginationService.create<BlogsModelType,BlogDocument>(
            restQuery,
            this.BlogsModel,
            projection,
            filter,
            true
        );

        return this.paginationService.transformPagination<BlogsViewModel,BlogDocument>(pagination)
    }
    async findById(id: string): Promise<BlogsViewModel> {
        const blog: BlogDocument = await this.BlogsModel.findOne({ id }, projection);
        if (!blog) {
            throw new NotFoundException('blog not found');
        }
        if(blog.checkBan()) {
            throw new NotFoundException('blog not found');
        }
        return this._getBlogMapped(blog);
    }
    private _getBlogMapped(doc: BlogDocument): BlogsViewModel {
        return ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            websiteUrl: doc.websiteUrl,
            createdAt: doc.createdAt,
            isMembership: doc.isMembership
        })
    }
}