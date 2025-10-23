/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { TagsBlogsModule } from './features/tags-blogs/tags-blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'DATABASE_URL',
          'mongodb://localhost:27017/test',
        ),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TagsBlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
