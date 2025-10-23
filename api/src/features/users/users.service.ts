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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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
}
