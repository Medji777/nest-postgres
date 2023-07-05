import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateAuthCommand} from "../commands";
import {SecurityService} from "../../../security/security.service";
import {ActiveCodeAdapter} from "../../../../adapters/activeCode.adapter";
import {AuthService} from "../../auth.service";
import {TokenPayload} from "../../../../types/auth";

@CommandHandler(CreateAuthCommand)
export class CreateAuthCommandHandler implements ICommandHandler<CreateAuthCommand> {
    constructor(
        private authService: AuthService,
        private securityService: SecurityService,
        private activeCodeAdapter: ActiveCodeAdapter,
    ) {}
    async execute(command: CreateAuthCommand): Promise<TokenPayload> {
        const {userId,deviceName,ip} = command;

        const deviceId = this.activeCodeAdapter.generateId();

        const {
            accessToken,
            refreshToken
        } = await this.authService.createTokens(userId, deviceId)

        await this.securityService.createSessionSql(refreshToken, deviceName, ip);
        return {
            token: {
                accessToken,
            },
            refreshToken,
            options: {
                httpOnly: true,
                secure: false,
            },
        };
    }
}