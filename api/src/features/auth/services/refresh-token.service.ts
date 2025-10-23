import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import { JwtUtil } from '../../../common/utils';

@Injectable()
export class RefreshTokenService {
  constructor(
    private authRepository: AuthRepository,
    private jwtUtil: JwtUtil,
  ) {}

  async refreshToken(refreshToken: string): Promise<string> {
    const tokenDoc = await this.authRepository.findRefreshToken(refreshToken);

    if (!tokenDoc || !tokenDoc.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtUtil.signAccessToken(
      tokenDoc.userId.toString(),
    );

    return newAccessToken;
  }
}
