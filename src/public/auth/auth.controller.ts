import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';
//import { LimitIpGuard } from "./guards/limitIp.guard";
import {
  CreateAuthCommand,
  DeleteSessionByDeviceIdCommand,
  PasswordRecoveryCommand,
  RefreshTokenCommand,
  ResendingCodeCommand,
  SaveUserCommand
} from "./useCase/commands";
import { UserInputModelDto } from '../../users/dto';
import {
  RegConfirmCodeModelDto,
  RegEmailResendingDto,
  PasswordRecoveryInputModelDto,
  NewPassRecIMDto,
} from './dto';
import {UsersSqlQueryRepository} from "../../users/repository/users-sql.query-repository";
import {UpdatePasswordCommand} from "./useCase/commands/updatePassword.command";
import {ConfirmUserCommand} from "./useCase/commands/confirmUser.command";

@Controller('auth')
export class AuthController {
  constructor(
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private commandBus: CommandBus
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {

    const authData = await this.commandBus.execute(
        new CreateAuthCommand(req.user.id,userAgent || 'device', ip)
    )
    res.cookie('refreshToken', authData.refreshToken, authData.options);
    return authData.token;
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response
  ) {
    await this.commandBus.execute(
        new DeleteSessionByDeviceIdCommand(req.user.deviceId)
    )
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  meProfile(@Req() req: Request) {
    return {
      email: req.user.email,
      login: req.user.login,
      userId: req.user.id,
    };
  }

  @Post('registration')
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() bodyDTO: UserInputModelDto) {
    await this.commandBus.execute(
        new SaveUserCommand(bodyDTO)
    )
  }

  @Post('registration-confirmation')
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmation(@Body() bodyDTO: RegConfirmCodeModelDto) {
    await this.commandBus.execute(
        new ConfirmUserCommand(bodyDTO.code)
    )
  }

  @Post('registration-email-resending')
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async emailResending(@Body() bodyDTO: RegEmailResendingDto) {
    await this.commandBus.execute(
        new ResendingCodeCommand(bodyDTO)
    )
  }

  @Post('password-recovery')
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() bodyDTO: PasswordRecoveryInputModelDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersSqlQueryRepository.getUserByLoginOrEmail(bodyDTO.email);
    if (!user) {
      return res.sendStatus(HttpStatus.NO_CONTENT);
    }
    await this.commandBus.execute(
        new PasswordRecoveryCommand(bodyDTO.email)
    )
  }

  @Post('new-password')
  //@UseGuards(LimitIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() bodyDTO: NewPassRecIMDto) {
    await this.commandBus.execute(
        new UpdatePasswordCommand(bodyDTO.recoveryCode, bodyDTO.newPassword)
    )
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authData = await this.commandBus.execute(
        new RefreshTokenCommand(req.user.userId, req.user.deviceId)
    )
    res.cookie('refreshToken', authData.refreshToken, authData.options);
    return authData.token;
  }
}
