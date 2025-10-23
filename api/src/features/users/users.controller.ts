import {
  Controller,
  Get,
  Put,
  Delete,
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

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
