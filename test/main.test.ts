import {Test, TestingModule} from "@nestjs/testing";
import {useContainer} from "class-validator";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import cookieParser from "cookie-parser";
import {AppModule} from "../src/app/app.module";
import {HttpExceptionFilter} from "../src/utils/filters/httpException.filter";
import {ValidationPipeConfig} from "../src/utils/pipes/validationConfig.pipe";

export async function createNestAppTest(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();

    const app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(ValidationPipeConfig));
    app.useGlobalFilters(new HttpExceptionFilter());
    return app;
}