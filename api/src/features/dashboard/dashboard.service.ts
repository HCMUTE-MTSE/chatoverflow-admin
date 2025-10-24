import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardStats() {
    const [totalQuestions, totalBlogs, totalUsers, totalTags, topUsers] =
      await Promise.all([
        this.dashboardRepository.countTotalQuestions(),
        this.dashboardRepository.countTotalBlogs(),
        this.dashboardRepository.countTotalUsers(),
        this.dashboardRepository.countTotalTags(),
        this.dashboardRepository.getTopUsers(5),
      ]);

    return {
      totalQuestions,
      totalBlogs,
      totalUsers,
      totalTags,
      topUsers,
    };
  }
}
