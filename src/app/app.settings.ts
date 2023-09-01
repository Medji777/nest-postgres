import cookieParser from "cookie-parser";
import {useContainer} from "class-validator";
import {AppModule} from "./app.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {ValidationPipeConfig} from "../utils/pipes/validationConfig.pipe";
import {HttpExceptionFilter} from "../utils/filters/httpException.filter";

export const appSettings = (app: INestApplication): void => {
    app.enableCors();
    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe(ValidationPipeConfig));
    app.useGlobalFilters(new HttpExceptionFilter());
}