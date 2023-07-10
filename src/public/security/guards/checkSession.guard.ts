import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { SecuritySqlQueryRepository } from "../repository/securitySql.query-repository";

@Injectable()
export class CheckSessionGuard implements CanActivate {
  constructor(
    private readonly securitySqlQueryRepository: SecuritySqlQueryRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request<{ deviceId: string }> = context.switchToHttp().getRequest();
    const isInclude = await this.securitySqlQueryRepository.checkSessionByDeviceId(
      req.params.deviceId,
    );
    if (!isInclude) {
      throw new NotFoundException();
    }
    const session = await this.securitySqlQueryRepository.findSession(
      req.user.userId,
      req.params.deviceId,
    );
    if (!session) {
      throw new ForbiddenException();
    }
    return true;
  }
}
