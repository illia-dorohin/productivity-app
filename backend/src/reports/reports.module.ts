import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MetricsModule } from '../metrics/metrics.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [MetricsModule, RatingsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
