import { ConfigModule } from '@nestjs/config';

export const settings = {
  START_MODULE: ConfigModule.forRoot(),
  BASIC_LOGIN: process.env.BASIC_LOGIN,
  BASIC_PASS: process.env.BASIC_PASS,
  mongoURI: process.env.mongoURI || 'mongodb://0.0.0.0:27017',
  PORT: process.env.PORT || '3000',
  JWT_SECRET: process.env.SECRET || '123',
  JWT_REFRESH_SECRET: process.env.REFRESH_SECRET || '456',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_BASE_URI: process.env.EMAIL_BASE_URI,
  PG_HOST: process.env.PG_HOST || 'localhost',
  PG_USER: process.env.PG_USER || 'nest',
  PG_PASSWORD: process.env.PG_PASSWORD || 'nest',
  PG_DB_NAME: process.env.PG_DB_NAME || 'nest',
  PG_PORT: +process.env.PG_PORT || 5433
};
