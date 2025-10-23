import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardStats() {
    const [totalQuestions, totalBlogs, totalUsers, totalTags] =
      await Promise.all([
        this.dashboardRepository.countTotalQuestions(),
        this.dashboardRepository.countTotalBlogs(),
        this.dashboardRepository.countTotalUsers(),
        this.dashboardRepository.countTotalTags(),
      ]);

    return {
      totalQuestions,
      totalBlogs,
      totalUsers,
      totalTags,
    };
  }
}
