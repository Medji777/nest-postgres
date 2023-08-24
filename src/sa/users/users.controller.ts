import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {BanUserCommand, CreateUserCommand, DeleteUserCommand} from "./useCase/command";
import {UsersService} from "./users.service";
import {BasicGuard} from "../../public/auth/guards/basic.guard";
import {QueryUsersDto, UserInputModelDto} from "../../users/dto";
import {BanInputDto} from "./dto";
import {UsersSqlQueryRepository} from "../../users/repository/users-sql.query-repository";
import {Paginator} from "../../types/types";
import {UserViewModelSA} from "../../types/users";
import {UsersSqlType} from "../../types/sql/user.sql";

@Controller('sa/users')
export class SAUsersController {
    constructor(
        private commandBus: CommandBus,
        private usersService: UsersService,
        private usersSqlQueryRepository: UsersSqlQueryRepository,
    ) {}

    @UseGuards(BasicGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllUsers(@Query() queryDTO: QueryUsersDto): Promise<Paginator<UserViewModelSA>> {
        return this.usersSqlQueryRepository.getAll(queryDTO)
    }

    @UseGuards(BasicGuard)
    @Get('test')
    @HttpCode(HttpStatus.OK)
    async getUser(@Query('email') email: string ): Promise<UsersSqlType> {
        return this.usersSqlQueryRepository.getUserByLoginOrEmail(email)
    }

    @UseGuards(BasicGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() bodyDTO: UserInputModelDto): Promise<UserViewModelSA> {
        const model = await this.commandBus.execute(
            new CreateUserCommand(bodyDTO)
        )
        return this.usersService.createUserSqlMapped(model)
    }

    @UseGuards(BasicGuard)
    @Put(':id/ban')
    @HttpCode(HttpStatus.NO_CONTENT)
    async banUnbanFlow(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() bodyDTO: BanInputDto
    ): Promise<void> {
       await this.commandBus.execute(
           new BanUserCommand(id, bodyDTO)
       )
    }

    @UseGuards(BasicGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.commandBus.execute(
            new DeleteUserCommand(id)
        )
    }
}