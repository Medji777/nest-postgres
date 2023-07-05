import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, Blogs, BlogsModelType } from '../entity/blogs.schema';
import { BlogsViewModel } from '../../../types/blogs';
import { Paginator } from '../../../types/types';
import { QueryBlogsDTO } from '../dto';
import { PaginationService } from '../../../applications/pagination.service';

const projection = { _id: 0, __v: 0 };

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blogs.name) private BlogsModel: BlogsModelType,
    private readonly paginationService: PaginationService,
  ) {}
  async getAll(query: QueryBlogsDTO): Promise<Paginator<BlogsViewModel>> {
    const { searchNameTerm, ...restQuery } = query;
    let filter = {};
    if(searchNameTerm) {
      filter = { name: { $regex: new RegExp(searchNameTerm, 'gi') } }
    }
    filter = {
      ...filter,
      'blogOwnerInfo.isBanned': false,
      'banInfo.isBanned': false
    }
    const pagination = await this.paginationService.create<BlogsModelType,Array<BlogsModelType>>(
        restQuery,
        this.BlogsModel,
        {
          ...projection, blogOwnerInfo: 0, banInfo: 0
        },
        filter,
        true
    );
    return this.paginationService.transformPagination<BlogsViewModel,Array<BlogsModelType>>(pagination);
  }
  async findById(id: string): Promise<BlogsViewModel> {
    const doc: BlogDocument = await this.BlogsModel.findOne({ id }, projection);
    if (!doc) {
      throw new NotFoundException('blog not found');
    }
    if(doc.checkBan()) {
      throw new NotFoundException('blog not found');
    }
    return this._getBlogMapped(doc);
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
