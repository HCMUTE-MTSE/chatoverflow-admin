import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../auth.repository';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordService {
  constructor(private authRepository: AuthRepository) {}

  async resetPassword(
    userId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string; timestamp?: string }> {
    // Find user
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Người dùng không tìm thấy');
    }

    // Validate password strength
    const validation = this.validatePasswordStrength(
      resetPasswordDto.newPassword,
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update password
    await this.authRepository.updateUserPassword(userId, hashedPassword);

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
      timestamp: new Date().toISOString(),
    };
  }

  validatePasswordStrength(password: string): {
    valid: boolean;
    message?: string;
  } {
    if (password.length < 6) {
      return {
        valid: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      };
    }

    // Add more validation rules as needed
    // Example: require uppercase, lowercase, numbers, special chars

    return { valid: true };
  }
}
