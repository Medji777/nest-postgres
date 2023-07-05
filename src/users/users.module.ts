import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './entity/users.schema';
import { UsersQueryRepository } from './repository/users.query-repository';
import { PaginationService } from '../applications/pagination.service';
import { PassHashService } from '../applications/passHash.service';
import { UsersSqlQueryRepository } from "./repository/users-sql.query-repository";
import { UsersSqlRepository } from "./repository/users-sql.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Users.name, schema: UsersSchema}]),
  ],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    PaginationService,
    PassHashService,
  ],
  exports: [UsersService, UsersRepository, UsersQueryRepository, UsersSqlRepository, UsersSqlQueryRepository],
})
export class UsersModule {}
