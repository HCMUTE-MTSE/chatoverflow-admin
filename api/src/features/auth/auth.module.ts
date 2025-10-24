import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { LoginService } from './services/login.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { LogoutService } from './services/logout.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { ResetPasswordService } from './services/reset-password.service';
import { JwtUtil, OtpUtil } from '../../common/utils';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User, UserSchema } from './entities/user.entity';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './entities/refresh-token.entity';
import {
  UserPasswordReset,
  UserPasswordResetSchema,
} from './entities/user-password-reset.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: UserPasswordReset.name, schema: UserPasswordResetSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_ACCESS_SECRET',
          'your-secret-key',
        ),
        signOptions: {
          expiresIn: `${configService.get<number>('ACCESS_TOKEN_EXPIRES', 15)}m`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    LoginService,
    RefreshTokenService,
    LogoutService,
    ForgotPasswordService,
    ResetPasswordService,
    JwtUtil,
    OtpUtil,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, AuthRepository, JwtUtil],
})
export class AuthModule {}
