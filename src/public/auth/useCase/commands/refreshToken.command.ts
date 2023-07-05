export class RefreshTokenCommand {
    constructor(
        public userId: string,
        public deviceId: string
    ) {}
}