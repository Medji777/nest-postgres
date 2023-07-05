import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Users, UsersModelType} from "../../../users/entity/users.schema";
import {QueryUsersDto} from "../dto";
import {BlogsRepository} from "../../../public/blogs/repository/blogs.repository";
import {PaginationService} from "../../../applications/pagination.service";
import {UsersBloggerModel, UsersBloggerViewModel} from "../../../types/users";

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(Users.name) private UsersModel: UsersModelType,
        private blogsRepository: BlogsRepository,
        private paginationService: PaginationService
    ) {}

    async getBannedUserByBlogId(
        blogId: string,
        userId: string,
        query: QueryUsersDto
    ) {
        const blog = await this.blogsRepository.findById(blogId);
        if(!blog) throw new NotFoundException('blog not found');
        if(!blog.checkIncludeUser(userId)) {
            throw new ForbiddenException();
        }
        const {searchLoginTerm, ...restQuery} = query;
        let filter = {};
        if (searchLoginTerm) {
            filter = { login: { $regex: new RegExp(searchLoginTerm, 'gi') } };
        }

        filter = {
            ...filter,
            'banInfo.isBanned': false,
            'bloggerBanInfo.blogId': blogId
        }

        const aggregatePayload = [
            {
                $match: {
                    $and: [filter]
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    login: 1,
                    bloggerBanInfo: 1
                }
            }
        ]

        const {doc, ...restPag} = await this.paginationService.createAggregate<UsersModelType,Array<UsersBloggerModel>>(
            restQuery,
            this.UsersModel,
            filter,
            aggregatePayload
        )

        const mappedUsers: Array<UsersBloggerViewModel> = doc.map((user: UsersBloggerModel)=>this._getOutputBannedUser(user,blogId))
        return this.paginationService.transformPagination<UsersBloggerViewModel, Array<UsersBloggerViewModel>>({
            doc: mappedUsers,
            ...restPag
        })
    }

    private _getOutputBannedUser(
        user: UsersBloggerModel,
        blogId: string
    ): UsersBloggerViewModel {
        const [banInfo] = user.bloggerBanInfo.filter(
            (info) => info.blogId === blogId
        );
        return {
            id: user.id,
            login: user.login,
            banInfo: {
                isBanned: true,
                banDate: banInfo.banDate,
                banReason: banInfo.banReason
            }
        };
    }
}