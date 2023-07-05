export class UpdatePasswordCommand {
    constructor(public recoveryCode: string, public newPassword: string) {}
}