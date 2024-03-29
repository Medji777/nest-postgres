import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../../../applications/jwt.service';
import { settings } from '../../../config';
import {UsersSqlRepository} from "../../../users/repository/users-sql.repository";

@Injectable()
export class GetUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth) {
      return true;
    }
    const [name, bearerToken] = auth.split(' ');
    const result = await this.jwtService.getDecodeTokenCustom(
      bearerToken,
      settings.JWT_SECRET,
    );
    if (name === 'Bearer' && result?.userId) {
      req.user = await this.usersSqlRepository.findById(result.userId)
      //req.user = await this.usersQueryRepository.getUserByUserId(result.userId);
      return true;
    }
    return true;
  }
}
