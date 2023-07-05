import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './utils/filters/httpException.filter';
import { ValidationPipeConfig } from './utils/pipes/validationConfig.pipe';
import { settings } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe(ValidationPipeConfig));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(settings.PORT);
}
bootstrap();
