export class CreateAuthCommand {
    constructor(public userId: string, public deviceName: string, public ip: string) {}
}