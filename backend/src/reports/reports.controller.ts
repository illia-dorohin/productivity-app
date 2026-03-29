import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  async getWeekly(
    @CurrentUser() user: { userId: string },
    @Query('date') date: string,
  ) {
    const data = await this.reportsService.getWeeklyReport(user.userId, date);
    return { data };
  }

  @Get('monthly')
  async getMonthly(
    @CurrentUser() user: { userId: string },
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const data = await this.reportsService.getMonthlyReport(
      user.userId,
      parseInt(month, 10),
      parseInt(year, 10),
    );
    return { data };
  }

  @Get('trend')
  async getTrend(
    @CurrentUser() user: { userId: string },
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.reportsService.getTrend(user.userId, from, to);
    return { data };
  }
}
