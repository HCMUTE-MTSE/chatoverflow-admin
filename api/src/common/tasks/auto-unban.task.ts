import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../features/users/users.service';

@Injectable()
export class AutoUnbanTask {
  private readonly logger = new Logger(AutoUnbanTask.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private readonly usersService: UsersService) {}

  startAutoUnbanScheduler() {
    // Run every 10 seconds for test bans (reduced from 1 hour)
    this.intervalId = setInterval(async () => {
      await this.handleAutoUnban();
    }, 10000); // 10 seconds

    this.logger.log(
      'Auto-unban scheduler started (runs every 10 seconds for test bans)',
    );
  }

  stopAutoUnbanScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Auto-unban scheduler stopped');
    }
  }

  async handleAutoUnban() {
    this.logger.debug('Running auto-unban task');

    try {
      const result = await this.usersService.autoUnbanExpiredUsers();
      if (result.count > 0) {
        this.logger.log(
          `Auto-unbanned ${result.count} users: ${result.unbannedUsers.join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in auto-unban task:', error);
    }
  }

  async runNow() {
    this.logger.log('Running auto-unban task manually');
    await this.handleAutoUnban();
  }
}
