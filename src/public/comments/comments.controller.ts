import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param, ParseUUIDPipe,
  Put,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { CheckCommentsGuard } from './guards/checkComments.guard';
import { CommentInputModelDto, LikeInputModelDto } from './dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GetUserInterceptor } from '../auth/interceptors/getUser.interceptor';
import { CommentsSqlQueryRepository } from "./repository/commentsSql.query-repository";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteCommentCommand, UpdateContentCommand, UpdateStatusLikeCommand } from "./useCase/command";

@Controller('comments')
export class CommentsController {
  constructor(
      private readonly commandBus: CommandBus,
      private readonly commentSqlQueryRepository: CommentsSqlQueryRepository
  ) {}

  @Get(':id')
  @UseInterceptors(GetUserInterceptor)
  @HttpCode(HttpStatus.OK)
  async getComments(
      @Param('id', ParseUUIDPipe) id: string,
      @Req() req: Request
  ) {
    return this.commentSqlQueryRepository.findById(id, req.user?.id);
  }

  @Put(':id')
  @UseGuards(CheckCommentsGuard)
  @SetMetadata('checkUser', true)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bodyDTO: CommentInputModelDto,
  ) {
    await this.commandBus.execute(
        new UpdateContentCommand(id, bodyDTO)
    )
  }

  @Put(':id/like-status')
  @UseGuards(CheckCommentsGuard)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeAtComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bodyDTO: LikeInputModelDto,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(
        new UpdateStatusLikeCommand(id, req.user?.id, bodyDTO)
    )
  }

  @Delete(':id')
  @UseGuards(CheckCommentsGuard)
  @SetMetadata('checkUser', true)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComments(@Param('id', ParseUUIDPipe) id: string) {
    await this.commandBus.execute(
        new DeleteCommentCommand(id)
    )
  }
}
