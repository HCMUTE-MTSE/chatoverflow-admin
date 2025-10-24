import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import {
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { AutoUnbanTask } from '../../common/tasks/auto-unban.task';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly autoUnbanTask: AutoUnbanTask,
  ) {}

  @Get()
  async findAll(@Query(ValidationPipe) query: GetUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('stats/role')
  async getUsersByRole() {
    return this.usersService.getUsersByRole();
  }

  @Get('stats/status')
  async getUsersByStatus() {
    return this.usersService.getUsersByStatus();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateUserRoleDto.role);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, updateUserStatusDto.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/ban')
  @Roles('admin')
  async banUser(
    @Param('id') id: string,
    @Body(ValidationPipe) banUserDto: BanUserDto,
  ) {
    return this.usersService.banUser(id, banUserDto);
  }

  @Post(':id/unban')
  @Roles('admin')
  async unbanUser(
    @Param('id') id: string,
    @Body(ValidationPipe) unbanUserDto: UnbanUserDto,
  ) {
    return this.usersService.unbanUser(id, unbanUserDto);
  }

  // Test endpoint for ban functionality
  @Get('test-ban-email')
  async testBanEmail() {
    // This is just a test endpoint to verify email templates
    return {
      message: 'Ban user functionality is ready',
      availableEndpoints: [
        'POST /users/:id/ban - Ban a user with reason and email notification',
        'POST /users/:id/unban - Unban a user with email notification',
        'POST /users/auto-unban - Auto-unban expired temporary bans',
        'GET /users/temporary-bans - Get list of temporary banned users',
      ],
      sampleBanRequest: {
        reason: 'Violation of community guidelines',
        sendEmail: true,
        banDuration: 7, // days (0 = permanent)
      },
      sampleUnbanRequest: {
        sendEmail: true,
      },
    };
  }

  @Post('auto-unban')
  @Roles('admin')
  async autoUnbanExpiredUsers() {
    return this.usersService.autoUnbanExpiredUsers();
  }

  @Get('temporary-bans')
  @Roles('admin')
  async getTemporaryBannedUsers() {
    return this.usersService.getTemporaryBannedUsers();
  }

  @Post('run-auto-unban-now')
  @Roles('admin')
  async runAutoUnbanNow() {
    await this.autoUnbanTask.runNow();
    return { message: 'Auto-unban task executed successfully' };
  }
}
