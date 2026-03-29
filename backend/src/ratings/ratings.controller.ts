import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RatingsService } from './ratings.service';
import { UpsertRatingDto } from './dto/upsert-rating.dto';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get(':date')
  async getByDate(
    @CurrentUser() user: { userId: string },
    @Param('date') date: string,
  ) {
    const data = await this.ratingsService.getByDate(user.userId, date);
    return { data };
  }

  @Get()
  async getByRange(
    @CurrentUser() user: { userId: string },
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.ratingsService.getByDateRange(
      user.userId,
      from,
      to,
    );
    return { data };
  }

  @Put(':date')
  async upsert(
    @CurrentUser() user: { userId: string },
    @Param('date') date: string,
    @Body() dto: UpsertRatingDto,
  ) {
    const data = await this.ratingsService.upsert(user.userId, date, dto);
    return { data };
  }
}
