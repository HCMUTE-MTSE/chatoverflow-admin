import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../auth.repository';
import { OtpUtil } from '../../../common/utils';
import { UserDocument } from '../entities/user.entity';
import {
  RequestOtpDto,
  ResetPasswordWithOtpDto,
} from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private authRepository: AuthRepository,
    private otpUtil: OtpUtil,
  ) {}

  async requestOTP(
    requestOtpDto: RequestOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.otpUtil.sendOTP(requestOtpDto.email, 'reset');
    return result;
  }

  async resetPasswordWithOTP(
    resetDto: ResetPasswordWithOtpDto,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    // Verify OTP
    const verifyResult = await this.otpUtil.verifyOTP(
      resetDto.email,
      resetDto.otp,
    );

    if (!verifyResult.success || !verifyResult.user) {
      return { success: false, message: verifyResult.message };
    }

    // Reset password
    const resetResult = await this.resetPasswordByUser(
      verifyResult.user,
      resetDto.newPassword,
    );

    return resetResult;
  }

  private async resetPasswordByUser(
    user: UserDocument,
    newPassword: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.authRepository.updateUserPassword(
        user._id.toString(),
        hashedPassword,
      );
      await this.authRepository.deletePasswordResetByUserId(
        user._id.toString(),
      );

      return {
        success: true,
        message: 'Reset Password Successfully',
        data: { userId: user._id.toString(), email: user.email },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi reset mật khẩu',
      };
    }
  }
}
