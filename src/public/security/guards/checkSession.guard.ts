import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SecurityQueryRepository } from '../repository/security.query-repository';
import { Request } from 'express';

@Injectable()
export class CheckSessionGuard implements CanActivate {
  constructor(
    private readonly securityQueryRepository: SecurityQueryRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request<{ deviceId: string }> = context.switchToHttp().getRequest();
    const isInclude = await this.securityQueryRepository.checkSessionByDeviceId(
      req.params.deviceId,
    );
    if (!isInclude) {
      throw new NotFoundException();
    }
    const session = await this.securityQueryRepository.findSession(
      req.user.userId,
      req.params.deviceId,
    );
    if (!session) {
      throw new ForbiddenException();
    }
    return true;
  }
}
