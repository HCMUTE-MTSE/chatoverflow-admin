import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('total-questions')
  async getTotalQuestions() {
    const totalQuestions = await this.dashboardService.getTotalQuestions();
    return {
      totalQuestions,
    };
  }
}
