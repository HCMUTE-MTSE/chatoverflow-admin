import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';

@Injectable()
export class LogoutService {
  constructor(private authRepository: AuthRepository) {}

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.authRepository.revokeRefreshToken(refreshToken);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
  }
}
