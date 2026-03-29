import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { ReorderMetricsDto } from './dto/reorder-metrics.dto';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getTree(@CurrentUser() user: { userId: string }) {
    const data = await this.metricsService.getTree(user.userId);
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMetricDto,
  ) {
    const data = await this.metricsService.create(user.userId, dto);
    return { data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateMetricDto,
  ) {
    const data = await this.metricsService.update(user.userId, id, dto);
    return { data };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const data = await this.metricsService.softDelete(user.userId, id);
    return { data };
  }

  @Post('reorder')
  async reorder(
    @CurrentUser() user: { userId: string },
    @Body() dto: ReorderMetricsDto,
  ) {
    await this.metricsService.reorder(user.userId, dto);
    return { data: null };
  }

  @Post('seed')
  async seed(@CurrentUser() user: { userId: string }) {
    const data = await this.metricsService.seed(user.userId);
    return { data };
  }
}
