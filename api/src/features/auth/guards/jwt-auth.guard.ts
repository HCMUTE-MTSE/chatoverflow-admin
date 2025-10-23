import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtUtil } from '../../../common/utils';

@Injectable()
export class JwtAuthGuard {
  constructor(private jwtUtil: JwtUtil) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtUtil.verifyAccessToken(token);
      request.userId = payload.sub; // Attach userId to request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
