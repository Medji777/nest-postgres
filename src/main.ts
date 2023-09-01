import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { appSettings } from "./app/app.settings";
import { settings } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app)
  await app.listen(settings.PORT);
}
bootstrap();
