import {
  CanActivate,
  ExecutionContext,
  ForbiddenException, Inject,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { CommentsSqlRepository } from "../repository/commentsSql.repository";

export class CheckCommentsGuard implements CanActivate {
  constructor(
      @Inject(Reflector) private reflector: Reflector,
      private readonly commentsSqlRepository: CommentsSqlRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUser = this.reflector.get<boolean | undefined>('checkUser', context.getHandler());
    const req: Request = context.switchToHttp().getRequest();
    const comment = await this.commentsSqlRepository.findById(req.params.id)
    if (!comment) {
      throw new NotFoundException();
    }
    if (!!isUser && comment.userId !== req.user!.id) {
      throw new ForbiddenException();
    }
    return true;
  }
}
