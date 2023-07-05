import { SortDirections } from './types';

export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt?: string;
};

export type BanInfoModel = {
  isBanned: boolean;
  banDate: string | Date | null;
  banReason: string | null;
}

export type BanInputModel = Omit<BanInfoModel, 'banDate'>

export type UserViewModelSA = UserViewModel & {
  banInfo: BanInfoModel
}

export type BloggerBanInfo = {
  banDate: string;
  banReason: string;
  blogId: string;
}

export type PasswordHash = {
  passwordHash: string;
};

export type QueryUsers = {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  sortBy: string;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};

export type ConfirmModel = {
  confirmationCode?: string | null;
  expirationDate?: Date;
  isConfirmed: boolean;
};

export type EmailConfirmUserModel = ConfirmModel;

export type PasswordConfirmUserModel = ConfirmModel;

export type UsersBloggerModel = UserViewModel & {
  bloggerBanInfo: Array<BloggerBanInfo>
}

export type UsersBloggerViewModel = {
  id: string;
  login: string;
  banInfo: BanInfoModel
}
