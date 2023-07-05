import {Entity} from "typeorm";

@Entity()
export class UsersEntity {
    id: string;
    login: string;
    email: string;
    createdAt?: string;
    passwordHash: string;

}