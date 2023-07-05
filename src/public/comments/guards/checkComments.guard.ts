import {
  CanActivate,
  ExecutionContext,
  ForbiddenException, Inject,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsQueryRepository } from '../repository/comments.query-repository';
import { Reflector } from '@nestjs/core';

export class CheckCommentsGuard implements CanActivate {
  constructor(
      @Inject(Reflector) private reflector: Reflector,
      private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUser = this.reflector.get<boolean | undefined>('checkUser', context.getHandler());
    const req: Request = context.switchToHttp().getRequest();
    const comment = await this.commentsQueryRepository.findById(req.params.id);
    if (!comment) {
      throw new NotFoundException();
    }
    if (!!isUser && comment.commentatorInfo.userId !== req.user!.id) {
      throw new ForbiddenException();
    }
    return true;
  }
}
