import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationService } from '../applications/pagination.service';
import { PassHashService } from '../applications/passHash.service';
import { UsersSqlQueryRepository } from "./repository/users-sql.query-repository";
import { UsersSqlRepository } from "./repository/users-sql.repository";

@Module({
  imports: [],
  providers: [
    UsersService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    PaginationService,
    PassHashService,
  ],
  exports: [UsersService, UsersSqlRepository, UsersSqlQueryRepository],
})
export class UsersModule {}
