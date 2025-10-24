import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class JwtUtil {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  signAccessToken(userId: string): string {
    const expiresIn =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRES', 15) * 60; // minutes to seconds
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn,
      },
    );
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  getRefreshTokenExpiry(): Date {
    const expiresInMinutes = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES',
      10080,
    ); // 7 days
    return new Date(Date.now() + expiresInMinutes * 60 * 1000);
  }
}
