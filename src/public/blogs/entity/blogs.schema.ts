import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogsInputModel, BlogsViewModelDTO } from '../../../types/blogs';

export type BlogDocument = HydratedDocument<Blogs>;
export type BlogsModelType = Model<BlogDocument> & BlogsModelStatic;

@Schema({ _id: false })
class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string | null;

  @Prop({ required: true })
  userLogin: string | null;

  @Prop({ default: false })
  isBanned: boolean;
}

@Schema({ _id: false })
class BanInfo {
  @Prop({ default: false })
  isBanned: boolean;

  @Prop({default: null})
  banDate: string | null;
}

const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo)
const BanInfoSchema = SchemaFactory.createForClass(BanInfo)

@Schema()
export class Blogs {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop()
  createdAt?: string;

  @Prop()
  isMembership?: boolean;

  @Prop({ type: BlogOwnerInfoSchema, default: () => ({}) })
  blogOwnerInfo: BlogOwnerInfo

  @Prop({type: BanInfoSchema, default: () => ({})})
  banInfo: BanInfo

  update(payload: BlogsInputModel): void {
    this.name = payload.name;
    this.description = payload.description;
    this.websiteUrl = payload.websiteUrl;
  }
  updateBindUser(userId: string): void {
    this.blogOwnerInfo.userId = userId;
  }
  updateBan(isBanned: boolean): void {
    if (!isBanned) {
      this.banInfo.banDate = null
    } else {
      this.banInfo.banDate = new Date().toISOString()
    }
    this.banInfo.isBanned = isBanned;
  }

  checkIncludeUser(userId: string): boolean {
    return this.blogOwnerInfo.userId === userId
  }
  checkBindUser(): boolean {
    return this.blogOwnerInfo.userId !== null
  }
  checkBan(): boolean {
    return this.blogOwnerInfo.isBanned || this.banInfo.isBanned
  }

  static make(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    isMembership: boolean,
    BlogsModel: BlogsModelType,
  ): BlogDocument {
    const date = new Date();
    const newBlog = new BlogsViewModelDTO(
      `${+date}`,
      name,
      description,
      websiteUrl,
      date.toISOString(),
      isMembership,
    );
    return new BlogsModel({
      ...newBlog,
      blogOwnerInfo: {
        userId,
        userLogin
      }
    });
  }
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);

BlogsSchema.methods = {
  update: Blogs.prototype.update,
  updateBindUser: Blogs.prototype.updateBindUser,
  updateBan: Blogs.prototype.updateBan,
  checkIncludeUser: Blogs.prototype.checkIncludeUser,
  checkBindUser: Blogs.prototype.checkBindUser,
  checkBan: Blogs.prototype.checkBan
};

const blogsStaticMethods: BlogsModelStatic = {
  make: Blogs.make,
};

BlogsSchema.statics = blogsStaticMethods;

export type BlogsModelStatic = {
  make: (
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    userLogin: string,
    isMembership: boolean,
    BlogsModel: BlogsModelType,
  ) => BlogDocument;
};
