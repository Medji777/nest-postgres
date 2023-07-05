import { SortDirections } from './types';
import { PostInputModel } from './posts';

export type BlogsViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt?: string;
  isMembership?: boolean;
};

export type BlogOwnerInfo = {
  userId: string | null;
  userLogin: string | null;
}

export type BanInfo = {
  isBanned: boolean;
  banDate: Date | null;
}

export type BlogsSAViewModel = BlogsViewModel & {
  blogOwnerInfo: BlogOwnerInfo,
  banInfo: BanInfo
}

export class BlogsViewModelDTO {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt?: string,
    public isMembership?: boolean,
  ) {}
}

export type BlogsInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogPostInputModel = Omit<PostInputModel, 'blogId'>;

export type QueryBlogs = {
  searchNameTerm: string | null;
  sortBy: string;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};
