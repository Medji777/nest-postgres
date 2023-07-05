import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comments,
  CommentsDocument,
  CommentsModuleType,
} from '../entity/comments.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name) private CommentsModel: CommentsModuleType,
  ) {}
  create(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
    bloggerId: string,
  ): CommentsDocument {
    return this.CommentsModel.make(
        content,
        postId,
        userId,
        userLogin,
        bloggerId,
        this.CommentsModel,
    );
  }
  async findById(id: string): Promise<CommentsDocument> {
    return this.CommentsModel.findOne({ id });
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.CommentsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async deleteAll(): Promise<void> {
    await this.CommentsModel.deleteMany();
  }
  async save(model: CommentsDocument): Promise<void> {
    await model.save();
  }
}
