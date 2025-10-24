import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../auth.repository';
import { JwtUtil } from '../../../common/utils';
import { LoginDto } from '../dto/login.dto';
import { UserDocument } from '../entities/user.entity';

@Injectable()
export class LoginService {
  constructor(
    private authRepository: AuthRepository,
    private jwtUtil: JwtUtil,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    user: UserDocument;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.authRepository.findUserByEmail(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user role is admin
    if (user.toObject().role !== 'admin') {
      throw new UnauthorizedException('Access denied. Admin role required.');
    }

    const accessToken = this.jwtUtil.signAccessToken(user._id.toString());
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const refreshTokenExpiry = this.jwtUtil.getRefreshTokenExpiry();

    await this.authRepository.createRefreshToken(
      user._id.toString(),
      refreshToken,
      refreshTokenExpiry,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
