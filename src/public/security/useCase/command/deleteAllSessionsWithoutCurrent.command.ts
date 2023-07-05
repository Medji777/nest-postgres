export class DeleteAllSessionsWithoutCurrentCommand {
    constructor(
        public userId: string,
        public deviceId: string
    ) {}
}