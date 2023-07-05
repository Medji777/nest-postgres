import {UUID} from "crypto";

export type UsersSqlType = {
    id: UUID;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    passwordConfirmationCode: UUID | null;
    passwordExpirationDate: Date | null;
    passwordIsConfirmed: boolean;
    emailConfirmationCode: UUID;
    emailExpirationDate: Date;
    emailIsConfirmed: boolean;
    isBanned: boolean;
    banDate: Date | null;
    banReason: string | null;
};