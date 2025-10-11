import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './entities/refresh-token.entity';
import {
  UserPasswordReset,
  UserPasswordResetDocument,
} from './entities/user-password-reset.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(UserPasswordReset.name)
    private passwordResetModel: Model<UserPasswordResetDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).select('+password').exec();
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return await this.userModel.findById(userId).exec();
  }

  async updateUserPassword(
    userId: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenDocument> {
    const refreshToken = new this.refreshTokenModel({
      userId,
      token,
      expiresAt,
    });
    return await refreshToken.save();
  }

  async findRefreshToken(token: string): Promise<RefreshTokenDocument | null> {
    return await this.refreshTokenModel
      .findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .populate('userId')
      .exec();
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ token }, { isRevoked: true })
      .exec();
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId }, { isRevoked: true })
      .exec();
  }

  // Password Reset OTP methods
  async createOrUpdatePasswordReset(
    userId: string,
    otpHash: string,
    expiresAt: Date,
  ): Promise<UserPasswordResetDocument> {
    return await this.passwordResetModel
      .findOneAndUpdate(
        { userId },
        { otpHash, otpExpiresAt: expiresAt, attempts: 0 },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findPasswordResetByUserId(
    userId: string,
  ): Promise<UserPasswordResetDocument | null> {
    return await this.passwordResetModel.findOne({ userId }).exec();
  }

  async incrementPasswordResetAttempts(resetId: string): Promise<void> {
    await this.passwordResetModel
      .updateOne({ _id: resetId }, { $inc: { attempts: 1 } })
      .exec();
  }

  async deletePasswordResetByUserId(userId: string): Promise<void> {
    await this.passwordResetModel.deleteMany({ userId }).exec();
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenModel
      .deleteMany({
        $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
      })
      .exec();
  }
}
