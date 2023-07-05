import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RefreshTokenCommand} from "../commands";
import {SecurityService} from "../../../security/security.service";
import {TokenPayload} from "../../../../types/auth";
import {AuthService} from "../../auth.service";

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<RefreshTokenCommand> {
    constructor(
        private authService: AuthService,
        private securityService: SecurityService,
    ) {}
    async execute(command: RefreshTokenCommand): Promise<TokenPayload> {
        const {userId, deviceId} = command;

        const {
            accessToken,
            refreshToken
        } = await this.authService.createTokens(userId, deviceId)

        await this.securityService.updateLastActiveDataSessionSql(refreshToken);
        return {
            token: {
                accessToken,
            },
            refreshToken,
            options: {
                httpOnly: true,
                secure: true,
            },
        };
    }
}