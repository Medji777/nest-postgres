import {Injectable} from '@nestjs/common';
import {HydratedDocument, Model, PipelineStage, QueryWithHelpers} from 'mongoose';
import {getSortNumber} from '../utils/sort';
import {transformPagination} from "../utils/transform";
import {SortDirections} from "../types/types";
import {PaginationDto} from "../utils/dto/pagination.dto";

type Pagination<D> = {
  doc: D | any;
  pageSize: number;
  pageNumber: number;
  count: number;
};

type Sort = Record<string, 1 | -1>

type PaginationAggregate = {
  config: Array<PipelineStage>;
  pageSize: number;
  pageNumber: number;
  count: number;
};

type Query = {
  sortBy: string,
  sortDirection: SortDirections,
  pageNumber: number,
  pageSize: number
}

@Injectable()
export class PaginationService {
  public async create<M extends Model<any>, D extends HydratedDocument<any> | D>(
      query: Query,
      model: M,
      projection = {},
      filter = {},
      isLean: boolean = false
  ): Promise<Pagination<D>> {
    const { pageNumber, pageSize } = query;
    const count = await model.countDocuments(filter);
    const Model = this.createModel(query, model, projection, filter);
    const doc = await (!isLean ? Model : Model.lean());

    return {
      doc,
      pageSize,
      pageNumber,
      count,
    };
  }
  public async createAggregate<M extends Model<any>, D extends any>(
      query: Query,
      model: M,
      filter = {},
      aggregatePayload: Array<PipelineStage>
  ): Promise<Pagination<D>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const count = await model.countDocuments(filter);

    const sort: Sort = {
      [sortBy]: getSortNumber(sortDirection)
    }
    const skip = (pageNumber - 1) * pageSize
    const config = [
      { $sort: sort },
      { $skip: skip },
      { $limit: pageSize },
    ]

    const doc: Array<D> = await model.aggregate([
        ...aggregatePayload,
        ...config
    ])

    return {
      doc,
      pageSize,
      pageNumber,
      count,
    }
  }
  public transformPagination<T,D>(pagination: Pagination<D>) {
    return transformPagination<T>(
        pagination.doc,
        pagination.pageSize,
        pagination.pageNumber,
        pagination.count,
    )
  }
  public paginationOptions(queryDto: PaginationDto): string {
    return `
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize}
             offset ${(queryDto.pageNumber - 1) * queryDto.pageSize}
        `
  }
  private createModel(query: Query, model, projection, filter): QueryWithHelpers<any, any> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;
    const sortNumber = getSortNumber(sortDirection);
    const skipNumber = (pageNumber - 1) * pageSize;
    return model
        .find(filter, projection)
        .sort({ [sortBy]: sortNumber })
        .skip(skipNumber)
        .limit(pageSize)
  }
}
