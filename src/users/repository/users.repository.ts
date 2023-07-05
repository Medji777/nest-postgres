import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument, UsersModelType } from '../entity/users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(Users.name) private UserModel: UsersModelType) {}

  create(
    login: string,
    email: string,
    passwordHash: string,
    dto?,
  ): UsersDocument {
    return this.UserModel.make(login, email, passwordHash, this.UserModel, dto);
  }

  async getUserByUniqueField(
    uniqueField: string,
  ): Promise<UsersDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { login: uniqueField },
        { email: uniqueField },
        { 'emailConfirmation.confirmationCode': uniqueField },
        { 'passwordConfirmation.confirmationCode': uniqueField },
      ],
    });
  }

  async findById(id: string): Promise<UsersDocument | null> {
    return this.UserModel.findOne({ id });
  }

  async findByEmailConfirmCode(code: string): Promise<UsersDocument | null> {
    return this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.UserModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async deleteAll(): Promise<void> {
    await this.UserModel.deleteMany();
  }
  async save(model: UsersDocument): Promise<UsersDocument> {
    return model.save();
  }
}
