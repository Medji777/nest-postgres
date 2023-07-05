import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {BlogDocument, Blogs, BlogsModelType} from "../../../public/blogs/entity/blogs.schema";

@Injectable()
export class BloggerBlogsRepository {
    constructor(@InjectModel(Blogs.name) private BlogsModel: BlogsModelType) {}
    async findBlogById(id: string): Promise<BlogDocument | null> {
        return this.BlogsModel.findOne({ id });
    }
    async save(model: BlogDocument): Promise<BlogDocument> {
        return model.save();
    }
}