import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument, Blogs, BlogsModelType } from '../entity/blogs.schema';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blogs.name) private BlogsModel: BlogsModelType) {}
  create(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    isMembership: boolean,
  ): BlogDocument {
    return this.BlogsModel.make(
        name,
        description,
        websiteUrl,
        userId,
        userLogin,
        isMembership,
        this.BlogsModel,
    );
  }
  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogsModel.findOne({ id });
  }
  async save(model: BlogDocument): Promise<BlogDocument> {
    return model.save();
  }
  async updateAllBanInfoUserAtBlogs(userId: string, isBanned: boolean) {
    await this.BlogsModel.updateMany({
      'blogOwnerInfo.userId': userId
    },{$set: {'blogOwnerInfo.isBanned': isBanned}})
  }
  async deleteById(id: string): Promise<boolean> {
    const result = await this.BlogsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async deleteAll(): Promise<void> {
    await this.BlogsModel.deleteMany();
  }
}
