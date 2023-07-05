import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersSqlQueryRepository } from "../../users/repository/users-sql.query-repository";

@ValidatorConstraint({ name: 'checkUniqueLogin', async: true })
@Injectable()
export class CheckUniqueLoginValidate implements ValidatorConstraintInterface {
    constructor(private usersSqlQueryRepository: UsersSqlQueryRepository) {}
    async validate(login: string): Promise<boolean> {
        return this.usersSqlQueryRepository.getIsUniqueUserByLogin(login)
    }
    defaultMessage(): string {
        return 'User already registration';
    }
}