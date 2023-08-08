import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {PaginationService} from "../../../applications/pagination.service";
import {PaginationDto} from "../../../utils/dto/pagination.dto";

@Injectable()
export class PostsSqlQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private paginationService: PaginationService
    ) {}

    async getPostsForBlog(queryDTO: PaginationDto, blogId: string) {
        const query = ``;
        const queryCount = ``;
        const dataArray = await this.dataSource.query(query)
        const [data] = await this.dataSource.query(queryCount)
    }
}