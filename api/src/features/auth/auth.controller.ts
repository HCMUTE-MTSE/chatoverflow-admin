import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { LoginService } from './services/login.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { LogoutService } from './services/logout.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { ResetPasswordService } from './services/reset-password.service';
import { LoginDto } from './dto/login.dto';
import {
  RequestOtpDto,
  ResetPasswordWithOtpDto,
} from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserId } from './decorators/user-id.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private loginService: LoginService,
    private refreshTokenService: RefreshTokenService,
    private logoutService: LogoutService,
    private forgotPasswordService: ForgotPasswordService,
    private resetPasswordService: ResetPasswordService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { user, accessToken, refreshToken } =
        await this.loginService.login(loginDto);

      const refreshTokenMaxAge =
        this.configService.get<number>('REFRESH_TOKEN_EXPIRES', 10080) *
        60 *
        1000;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenMaxAge,
      });

      const response = ApiResponseDto.success('Login successfully', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status,
        },
        accessToken,
      });

      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';

      const response = ApiResponseDto.error(message);
      return res.status(statusCode).json(response);
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        const response = ApiResponseDto.error('Refresh token not provided');
        return res.status(HttpStatus.UNAUTHORIZED).json(response);
      }

      const accessToken =
        await this.refreshTokenService.refreshToken(refreshToken);

      const response = ApiResponseDto.success('Token refreshed successfully', {
        accessToken,
      });

      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      res.clearCookie('refreshToken');

      const response = ApiResponseDto.error(
        error.message || 'Invalid refresh token',
      );
      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      await this.logoutService.logout(refreshToken);

      res.clearCookie('refreshToken');

      const response = ApiResponseDto.success('Logout successfully');
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response = ApiResponseDto.error(error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Post('forgot-password/request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOTP(@Body() requestOtpDto: RequestOtpDto, @Res() res: Response) {
    try {
      const result = await this.forgotPasswordService.requestOTP(requestOtpDto);

      if (!result.success) {
        const response = ApiResponseDto.error(result.message);
        return res.status(HttpStatus.OK).json(response);
      }

      const response = ApiResponseDto.success('OTP has been sent', {
        email: requestOtpDto.email,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response = ApiResponseDto.error(error.message);
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithOTP(
    @Body() resetDto: ResetPasswordWithOtpDto,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.forgotPasswordService.resetPasswordWithOTP(resetDto);

      if (!result.success) {
        const response = ApiResponseDto.error(result.message);
        return res.status(HttpStatus.OK).json(response);
      }

      const response = ApiResponseDto.success(result.message, result.data);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response = ApiResponseDto.error('System Error');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @UserId() userId: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    try {
      if (!userId) {
        const response = ApiResponseDto.error('Phiên đăng nhập không hợp lệ');
        return res.status(HttpStatus.UNAUTHORIZED).json(response);
      }

      const result = await this.resetPasswordService.resetPassword(
        userId,
        resetPasswordDto,
      );

      const response = ApiResponseDto.success(result.message, {
        timestamp: result.timestamp,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const response = ApiResponseDto.error(
        error.message || 'Lỗi hệ thống khi đổi mật khẩu',
      );
      return res.status(statusCode).json(response);
    }
  }
}
