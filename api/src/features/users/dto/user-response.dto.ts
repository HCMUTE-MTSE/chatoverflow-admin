import { User } from '../../auth/entities/user.entity';

export class UserResponseDto {
  _id: string;
  name: string;
  nickName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: {
    province?: string;
    ward?: string;
    street?: string;
  };
  gender: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  bannedUsers: number;
}

export class UserRoleStatsDto {
  _id: string;
  count: number;
}

export class UserStatusStatsDto {
  _id: string;
  count: number;
}
