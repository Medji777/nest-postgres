import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from '../auth/strategies/jwt-refresh.stategy';
import { settings } from "../../config";
import {
  DeleteAllSessionsWithoutCurrentSqlCommandHandler,
  DeleteSessionByDeviceIdSqlCommandHandler
} from "./useCase/handler";
import { CqrsModule } from "@nestjs/cqrs";
import { SecuritySqlRepository } from "./repository/securitySql.repository";
import { SecuritySqlQueryRepository } from "./repository/securitySql.query-repository";

const CommandHandlers = [
  DeleteAllSessionsWithoutCurrentSqlCommandHandler,
  DeleteSessionByDeviceIdSqlCommandHandler
]

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: settings.JWT_SECRET
    }),
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    SecuritySqlRepository,
    SecuritySqlQueryRepository,
    JwtRefreshStrategy,
    ...CommandHandlers
  ],
  exports: [SecurityService],
})
export class SecurityModule {}
