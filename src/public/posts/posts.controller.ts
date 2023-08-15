import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Get,
  Post,
  Put,
  UseGuards,
  Req,
  UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from "@nestjs/cqrs";
import { CreateCommentByPostCommand, UpdateStatusLikeCommand } from "./useCase/command";
import { CommentDBModel, CommentViewModel } from '../../types/comments';
import { QueryPostsDto, LikeInputModelDto } from './dto';
import { CommentInputModelDto, QueryCommentsDto } from '../comments/dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GetUserInterceptor } from '../auth/interceptors/getUser.interceptor';
import { PostsSqlQueryRepository } from "./repository/postsSql.query-repository";
import { CommentsSqlQueryRepository } from "../comments/repository/commentsSql.query-repository";
import { Paginator } from "../../types/types";
import { PostsViewModel } from "../../types/posts";

@Controller('posts')
export class PostsController {
  constructor(
      private commandBus: CommandBus,
      private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
      private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository
  ) {}

  @Get()
  @UseInterceptors(GetUserInterceptor)
  @HttpCode(HttpStatus.OK)
  getPosts(
      @Query() query: QueryPostsDto,
      @Req() req: Request
  ): Promise<Paginator<PostsViewModel>> {
    return this.postsSqlQueryRepository.getAll(query, req.user?.id);
  }

  @Get(':id')
  @UseInterceptors(GetUserInterceptor)
  @HttpCode(HttpStatus.OK)
  async getPostById(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: Request
  ): Promise<PostsViewModel> {
    return this.postsSqlQueryRepository.findById(id, req.user?.id);
  }

  @Get('/:id/comments')
  @UseInterceptors(GetUserInterceptor)
  @HttpCode(HttpStatus.OK)
  async getCommentByPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() queryDTO: QueryCommentsDto,
    @Req() req: Request,
  ): Promise<Paginator<CommentViewModel>> {
    return this.commentsSqlQueryRepository.getCommentsByPostId(
        id,
        queryDTO,
        req.user?.id
    )
  }

  @Post('/:id/comments')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bodyDTO: CommentInputModelDto,
    @Req() req: Request,
  ): Promise<CommentDBModel> {
     return this.commandBus.execute(
         new CreateCommentByPostCommand(id,req.user,bodyDTO)
     )
  }

  @Put('/:id/like-status')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatusLike(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bodyDTO: LikeInputModelDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateStatusLikeCommand(
        req.user.id,
        req.user.login,
        id,
        bodyDTO,
    ))
  }
}
