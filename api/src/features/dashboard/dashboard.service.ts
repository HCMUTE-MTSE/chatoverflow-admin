import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getTotalQuestions(): Promise<number> {
    return await this.dashboardRepository.countTotalQuestions();
  }
}
