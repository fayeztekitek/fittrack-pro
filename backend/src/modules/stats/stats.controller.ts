import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get today activity summary' })
  async getDaily(@CurrentUser() user: { id: string }) {
    return this.statsService.getDailyStats(user.id);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get last 7 days breakdown' })
  async getWeekly(@CurrentUser() user: { id: string }) {
    return this.statsService.getWeeklyStats(user.id);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get last 30 days aggregation' })
  async getMonthly(@CurrentUser() user: { id: string }) {
    return this.statsService.getMonthlyStats(user.id);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get consecutive day streak' })
  async getStreak(@CurrentUser() user: { id: string }) {
    return this.statsService.getStreak(user.id);
  }

  @Get('activity-breakdown')
  @ApiOperation({ summary: 'Get activity type distribution' })
  async getActivityBreakdown(@CurrentUser() user: { id: string }) {
    return this.statsService.getActivityBreakdown(user.id);
  }
}
