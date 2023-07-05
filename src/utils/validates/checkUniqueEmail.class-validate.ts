import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import {UsersSqlQueryRepository} from "../../users/repository/users-sql.query-repository";

@ValidatorConstraint({ name: 'checkUniqueEmail', async: true })
@Injectable()
export class CheckUniqueEmailValidate implements ValidatorConstraintInterface {
    constructor(private usersSqlQueryRepository: UsersSqlQueryRepository) {}
    async validate(email: string): Promise<boolean> {
        return this.usersSqlQueryRepository.getIsUniqueUserByEmail(
            email,
        );
    }
    defaultMessage(): string {
        return 'User already registration';
    }
}