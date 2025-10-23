import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/entities/user.entity';
import { GetUsersDto, SortBy, SortOrder } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsersResponseDto } from './dto/user-response.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async findAll(dto: GetUsersDto): Promise<PaginatedUsersResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = dto;

    // Build query
    const query: any = {};

    // Text search across name, nickname and email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nickName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by gender
    if (dto.gender) {
      query.gender = dto.gender;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password -tempPasswordHash') // Exclude sensitive fields
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password -tempPasswordHash')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Check if email is being updated and is unique
    if (updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateUserDto.email, _id: { $ne: id } })
        .exec();

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -tempPasswordHash')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async updateRole(id: string, role: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if (!['admin', 'user'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be "admin" or "user"');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select('-password -tempPasswordHash')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async updateStatus(id: string, status: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if (!['active', 'inactive', 'banned', 'pending'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password -tempPasswordHash')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  // Statistics methods
  async getUserStats() {
    const stats = await this.userModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
          },
          bannedUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'banned'] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        bannedUsers: 0,
      }
    );
  }

  async getUsersByRole() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getUsersByStatus() {
    return this.userModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /**
   * Ban user với lý do và gửi email thông báo
   */
  async banUser(
    id: string,
    banUserDto: BanUserDto,
  ): Promise<{ message: string; user: User }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.status === 'banned') {
      throw new BadRequestException('User is already banned');
    }

    // Prevent banning admin users
    if (user.role === 'admin') {
      throw new BadRequestException('Cannot ban admin users');
    }

    const banDate = new Date();
    let banExpiresAt: Date | null = null;

    // Calculate ban expiry date (0 = permanent)
    if (banUserDto.banDuration && banUserDto.banDuration > 0) {
      banExpiresAt = new Date();

      // Handle special case for seconds (for testing)
      if (banUserDto.banDuration === 5) {
        // 5 seconds for testing
        banExpiresAt.setTime(banExpiresAt.getTime() + 5 * 1000);
      } else {
        // Days calculation for normal durations
        banExpiresAt.setDate(banExpiresAt.getDate() + banUserDto.banDuration);
      }
    }

    // Update user status to banned
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          status: 'banned',
          banReason: banUserDto.reason,
          bannedAt: banDate,
          banExpiresAt: banExpiresAt,
        },
        { new: true },
      )
      .select('-password -tempPasswordHash')
      .exec();

    // Send email notification if requested
    if (banUserDto.sendEmail !== false) {
      try {
        await this.emailService.sendUserBannedNotification({
          to: user.email,
          userName: user.name,
          reason: banUserDto.reason,
          banDate: banDate,
          banExpiresAt: banExpiresAt,
        });
      } catch (error) {
        console.error('Failed to send ban notification email:', error);
        // Don't throw error, ban operation should still succeed
      }
    }

    const durationText =
      banUserDto.banDuration === 0 || !banUserDto.banDuration
        ? 'permanently'
        : banUserDto.banDuration === 5
          ? 'for 5 seconds'
          : `for ${banUserDto.banDuration} day${banUserDto.banDuration !== 1 ? 's' : ''}`;

    return {
      message: `User "${user.name}" has been banned ${durationText}`,
      user: updatedUser,
    };
  }

  /**
   * Unban user và gửi email thông báo
   */
  async unbanUser(
    id: string,
    unbanUserDto: UnbanUserDto,
  ): Promise<{ message: string; user: User }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.status !== 'banned') {
      throw new BadRequestException('User is not currently banned');
    }

    // Update user status to active
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          status: 'active',
          $unset: {
            banReason: 1,
            bannedAt: 1,
          },
          unbannedAt: new Date(),
        },
        { new: true },
      )
      .select('-password -tempPasswordHash')
      .exec();

    // Send email notification if requested
    if (unbanUserDto.sendEmail !== false) {
      try {
        await this.emailService.sendUserUnbannedNotification({
          to: user.email,
          userName: user.name,
          unbanDate: new Date(),
        });
      } catch (error) {
        console.error('Failed to send unban notification email:', error);
        // Don't throw error, unban operation should still succeed
      }
    }

    return {
      message: `User "${user.name}" has been unbanned successfully`,
      user: updatedUser,
    };
  }

  /**
   * Auto-unban users whose ban has expired
   */
  async autoUnbanExpiredUsers(): Promise<{
    count: number;
    unbannedUsers: string[];
  }> {
    const now = new Date();

    // Find users whose ban has expired
    const expiredBannedUsers = await this.userModel
      .find({
        status: 'banned',
        banExpiresAt: { $lte: now, $ne: null },
      })
      .exec();

    const unbannedUsers: string[] = [];

    for (const user of expiredBannedUsers) {
      try {
        // Update user status to active
        await this.userModel
          .findByIdAndUpdate(user._id, {
            status: 'active',
            $unset: {
              banReason: 1,
              bannedAt: 1,
              banExpiresAt: 1,
            },
            unbannedAt: new Date(),
          })
          .exec();

        // Send unban notification email
        try {
          await this.emailService.sendUserUnbannedNotification({
            to: user.email,
            userName: user.name,
            unbanDate: new Date(),
          });
        } catch (emailError) {
          console.error(
            `Failed to send unban email to ${user.email}:`,
            emailError,
          );
        }

        unbannedUsers.push(user.name);
        console.log(`Auto-unbanned user: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`Failed to auto-unban user ${user.name}:`, error);
      }
    }

    return {
      count: unbannedUsers.length,
      unbannedUsers,
    };
  }

  /**
   * Get users with temporary bans and their expiry info
   */
  async getTemporaryBannedUsers(): Promise<any[]> {
    return this.userModel
      .find({
        status: 'banned',
        banExpiresAt: { $ne: null },
      })
      .select('name email banReason bannedAt banExpiresAt')
      .sort({ banExpiresAt: 1 })
      .exec();
  }
}
