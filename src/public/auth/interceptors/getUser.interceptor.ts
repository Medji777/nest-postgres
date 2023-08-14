import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '../../../applications/jwt.service';
import { settings } from '../../../config';
import { UsersSqlRepository } from "../../../users/repository/users-sql.repository";

@Injectable()
export class GetUserInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth) {
      return next.handle();
    }
    const [name, bearerToken] = auth.split(' ');
    const result = await this.jwtService.getDecodeTokenCustom(
      bearerToken,
      settings.JWT_SECRET,
    );
    if (name === 'Bearer' && result?.userId) {
      req.user = await this.usersSqlRepository.findById(result.userId);
      return next.handle();
    }
    return next.handle();
  }
}
