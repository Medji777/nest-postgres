import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { CheckCommentsGuard } from './guards/checkComments.guard';
import { CommentInputModelDto, LikeInputModelDto } from './dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GetUserInterceptor } from '../auth/interceptors/getUser.interceptor';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @UseInterceptors(GetUserInterceptor)
  @HttpCode(HttpStatus.OK)
  async getComments(@Param('id') id: string, @Req() req: Request) {
    return this.commentsQueryRepository.findById(id, req.user?.id);
  }

  @Put(':id')
  @UseGuards(CheckCommentsGuard)
  @SetMetadata('checkUser', true)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComments(
    @Param('id') id: string,
    @Body() bodyDTO: CommentInputModelDto,
  ) {
    await this.commentsService.update(id, bodyDTO);
  }

  @Put(':id/like-status')
  @UseGuards(CheckCommentsGuard)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeAtComment(
    @Param('id') id: string,
    @Body() bodyDTO: LikeInputModelDto,
    @Req() req: Request,
  ) {
    await this.commentsService.updateLike(id, req.user?.id, bodyDTO);
  }

  @Delete(':id')
  @UseGuards(CheckCommentsGuard)
  @SetMetadata('checkUser', true)
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComments(@Param('id') id: string) {
    await this.commentsService.delete(id);
  }
}
