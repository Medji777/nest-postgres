import {InjectModel} from '@nestjs/mongoose';
import {Injectable, NotFoundException} from '@nestjs/common';
import {Users, UsersDocument, UsersModelType} from '../entity/users.schema';
import {PaginationService} from '../../applications/pagination.service';
import {QueryUsersDto} from '../dto';
import {BanStatus, Paginator} from '../../types/types';
import {UserViewModel, UserViewModelSA} from '../../types/users';

const projectionFilter = {
  _id: 0,
  passwordHash: 0,
  emailConfirmation: 0,
  passwordConfirmation: 0,
  bloggerBanInfo: 0,
  __v: 0,
};

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(Users.name) private UserModel: UsersModelType,
    private readonly paginationService: PaginationService,
  ) {}
  async getAll(query: QueryUsersDto): Promise<Paginator<UserViewModelSA>> {
    const arrayFilters = [];
    const { searchLoginTerm, searchEmailTerm, banStatus, ...restQuery } = query;
    if (!!searchLoginTerm) {
      arrayFilters.push({
        login: { $regex: new RegExp(searchLoginTerm, 'gi') },
      });
    }
    if (!!searchEmailTerm) {
      arrayFilters.push({
        email: { $regex: new RegExp(searchEmailTerm, 'gi') },
      });
    }
    if(banStatus !== BanStatus.all) {
      arrayFilters.push({
        "banInfo.isBanned": banStatus === BanStatus.banned
      })
    }
    const filter = !arrayFilters.length ? {} : { $or: arrayFilters };

    const pagination = await this.paginationService.create<UsersModelType,UsersDocument>(
        restQuery,
        this.UserModel,
        projectionFilter,
        filter,
        true
    );

    return this.paginationService.transformPagination<UserViewModelSA,UsersDocument>(pagination)
  }
  async getUserByLoginOrEmail(input: string): Promise<Users> {
    const user = this._getUserByLoginOrEmail(input);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }
  async getIsUniqueUserByLoginOrEmail(input: string): Promise<boolean> {
    const user = this._getUserByLoginOrEmail(input);
    return !user;
  }
  async getIsUniqueUserByLogin(login: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ login }).lean()
    return !user;
  }
  async getIsUniqueUserByEmail(email: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ email }).lean()
    return !user;
  }
  async getUserByUserId(userId: string): Promise<Users | null> {
    return this.UserModel.findOne({ id: userId }).lean();
  }
  private async _getUserByLoginOrEmail(input: string): Promise<Users> {
    return this.UserModel.findOne(
      { $or: [{ login: input }, { email: input }] },
      { _id: 0, __v: 0 },
    ).lean();
  }
  async getUserByCode(code: string): Promise<Users | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).lean();
  }
  async getUserByRecoveryCode(code: string): Promise<Users | null> {
    return this.UserModel.findOne({
      'passwordConfirmation.confirmationCode': code,
    }).lean();
  }
}
