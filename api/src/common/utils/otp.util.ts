import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { UserDocument } from '../../features/auth/entities/user.entity';
import { AuthRepository } from '../../features/auth/auth.repository';

@Injectable()
export class OtpUtil {
  private readonly OTP_EXPIRE_MINUTES = 10;

  constructor(
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {}

  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashOTPCode(otp: string): Promise<string> {
    return await bcrypt.hash(otp, 10);
  }

  private async compareOTPCode(
    otpInput: string,
    otpHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(otpInput, otpHash);
  }

  private getOTPExpirationTime(): Date {
    return new Date(Date.now() + this.OTP_EXPIRE_MINUTES * 60000);
  }

  private isOTPExpired(expirationTime: Date): boolean {
    return expirationTime < new Date();
  }

  private async sendEmailWithOTP(
    email: string,
    otp: string,
    type: 'signup' | 'reset',
    userName?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASS'),
        },
      });

      const emailConfigs = {
        signup: {
          subject: 'Xác thực đăng ký tài khoản',
          html: `
            <h3>Chào mừng ${userName || 'bạn'}!</h3>
            <p>Cảm ơn bạn đã đăng ký tài khoản ChatOverflow.</p>
            <p>Mã OTP để xác thực đăng ký tài khoản của bạn là:</p>
            <h2 style="color: #007bff; font-weight: bold; background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center;">${otp}</h2>
            <p>Mã này sẽ hết hạn sau ${this.OTP_EXPIRE_MINUTES} phút.</p>
            <p>Vui lòng nhập mã này để hoàn tất quá trình đăng ký.</p>
            <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
            <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
          `,
        },
        reset: {
          subject: 'Mã OTP đặt lại mật khẩu',
          html: `
            <h3>Đặt lại mật khẩu</h3>
            ${userName ? `<p>Xin chào ${userName},</p>` : ''}
            <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
            <h2 style="color: #dc3545; font-weight: bold; background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center;">${otp}</h2>
            <p>Mã này sẽ hết hạn sau ${this.OTP_EXPIRE_MINUTES} phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
          `,
        },
      };

      const config = emailConfigs[type];

      await transporter.sendMail({
        from: `"ChatOverflow" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: config.subject,
        html: config.html,
      });

      return { success: true, message: `Đã gửi mã OTP đến email ${email}` };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể gửi email',
      };
    }
  }

  async sendOTP(
    email: string,
    type: 'signup' | 'reset' = 'reset',
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find user with active or inactive status
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        return { success: false, message: 'Email không tồn tại' };
      }

      if (!['active', 'inactive'].includes(user.status)) {
        return { success: false, message: 'Tài khoản không hợp lệ' };
      }

      // Generate and store OTP
      const otp = this.generateOTPCode();
      const otpHash = await this.hashOTPCode(otp);
      const expiresAt = this.getOTPExpirationTime();

      await this.authRepository.createOrUpdatePasswordReset(
        user._id.toString(),
        otpHash,
        expiresAt,
      );

      // Send email
      const emailResult = await this.sendEmailWithOTP(
        email,
        otp,
        type,
        user.name,
      );

      return emailResult;
    } catch (error) {
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  async verifyOTP(
    email: string,
    otpInput: string,
    maxAttempts: number = 5,
  ): Promise<{ success: boolean; message: string; user?: UserDocument }> {
    try {
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        return { success: false, message: 'Không tìm thấy người dùng' };
      }

      const otpRecord = await this.authRepository.findPasswordResetByUserId(
        user._id.toString(),
      );

      if (!otpRecord) {
        return { success: false, message: 'Không tìm thấy yêu cầu OTP' };
      }

      if (otpRecord.attempts >= maxAttempts) {
        return { success: false, message: 'Vượt quá số lần thử OTP' };
      }

      if (this.isOTPExpired(otpRecord.otpExpiresAt)) {
        return { success: false, message: 'OTP đã hết hạn' };
      }

      const isMatch = await this.compareOTPCode(otpInput, otpRecord.otpHash);

      if (!isMatch) {
        await this.authRepository.incrementPasswordResetAttempts(
          otpRecord._id.toString(),
        );
        return { success: false, message: 'OTP không chính xác' };
      }

      return { success: true, message: 'Xác thực OTP thành công', user };
    } catch (error) {
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }
}
