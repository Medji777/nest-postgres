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
    async getAllUsers(@Query() queryDTO: QueryUsersDto ) {
        return this.usersSqlQueryRepository.getAll(queryDTO)
    }

    @UseGuards(BasicGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() bodyDTO: UserInputModelDto) {
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
    ) {
       await this.commandBus.execute(new BanUserCommand(id, bodyDTO))
    }

    @UseGuards(BasicGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
        await this.commandBus.execute(new DeleteUserCommand(id))
    }
}