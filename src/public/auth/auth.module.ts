import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from "@nestjs/cqrs";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { SecurityModule } from '../security/security.module';
import { EmailAdapter } from '../../adapters/email.adapter';
import { ActiveCodeAdapter } from '../../adapters/activeCode.adapter';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stategy';
import {
  CheckRecoveryCodeValidate,
  CheckRegistrationEmailValidate,
  CheckUniqueEmailValidate,
  CheckUniqueLoginValidate,
  CodeConfirmValidate,
} from '../../utils/validates';
import {
  CreateAuthCommandHandler,
  SaveUserCommandHandler,
  DeleteSessionByDeviceIdCommandHandler,
  ResendingCodeCommandHandler,
  RefreshTokenCommandHandler,
  PasswordRecoveryCommandHandler
} from "./useCase/handlers";
import {settings} from "../../config";
import {ConfirmUserCommandHandler} from "./useCase/handlers/confirmUser.command-handler";
import {UpdatePasswordCommandHandler} from "./useCase/handlers/updatePassword.command-handler";
import {PassHashService} from "../../applications/passHash.service";

const Strategy = [
  LocalStrategy,
  JwtAccessStrategy,
  JwtRefreshStrategy,
]
const Validates = [
  CodeConfirmValidate,
  CheckRecoveryCodeValidate,
  CheckRegistrationEmailValidate,
  CheckUniqueEmailValidate,
  CheckUniqueLoginValidate,
]
const CommandHandlers = [
  CreateAuthCommandHandler,
  SaveUserCommandHandler,
  DeleteSessionByDeviceIdCommandHandler,
  ResendingCodeCommandHandler,
  PasswordRecoveryCommandHandler,
  RefreshTokenCommandHandler,
  ConfirmUserCommandHandler,
  UpdatePasswordCommandHandler
]
const Services = [
  AuthService,
  EmailAdapter,
  ActiveCodeAdapter,
  PassHashService
]

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    PassportModule,
    SecurityModule,
    JwtModule.register({
      secret: settings.JWT_SECRET
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...Strategy,
    ...Services,
    ...Validates,
    ...CommandHandlers,
  ],
})
export class AuthModule {}
