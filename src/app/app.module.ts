import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../public/blogs/blogs.module';
import { PostsModule } from '../public/posts/posts.module';
import { CommentsModule } from '../public/comments/comments.module';
import { AuthModule } from '../public/auth/auth.module';
import { SecurityModule } from '../public/security/security.module';
import { BloggerBlogModule } from "../bloggers/blogs/blogs.module";
import { BloggerUsersModule } from "../bloggers/users/users.module";
import { SABlogsModule } from "../sa/blogs/blogs.module";
import { SAUsersModule } from "../sa/users/users.module";
import { settings } from '../config';
import {TypeOrmModule} from "@nestjs/typeorm";

const PublicModule = [
  UsersModule,
  BlogsModule,
  PostsModule,
  CommentsModule,
  AuthModule,
  SecurityModule
]
const SAModule = [SABlogsModule, SAUsersModule]
const BloggerModule = [BloggerBlogModule, BloggerUsersModule]

@Module({
  imports: [
    settings.START_MODULE,
    MongooseModule.forRoot(settings.mongoURI),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'nest',
      password: 'nest',
      database: 'nest',
      autoLoadEntities: false,
      synchronize: false,
    }),
    ...PublicModule,
    ...BloggerModule,
    ...SAModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
