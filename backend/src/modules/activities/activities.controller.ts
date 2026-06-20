import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { Achievement } from './entities/achievement.entity';
import { GPSPoint } from './entities/gps-point.entity';
import { ActivitySegment } from './entities/activity-segment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  StartActivityDto,
  StopActivityDto,
  PauseActivityDto,
} from './dto/activity.dto';
import { BatchGPSPointsDto } from './dto/gps.dto';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * POST /activities/start
   * Start a new activity session
   */
  @Post('start')
  @ApiOperation({ summary: 'Start a new activity session' })
  @ApiResponse({ status: 201, description: 'Activity started successfully', type: Activity })
  @ApiResponse({ status: 400, description: 'Invalid activity type or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startActivity(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: StartActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.startActivity(user.id, dto);
  }

  /**
   * PATCH /activities/:id/stop
   * Stop an activity and finalize metrics
   */
  @Patch(':id/stop')
  @ApiOperation({ summary: 'Stop an activity session and finalize metrics' })
  @ApiResponse({ status: 200, description: 'Activity stopped successfully', type: Activity })
  @ApiResponse({ status: 400, description: 'Invalid activity data' })
  @ApiResponse({ status: 403, description: 'Not the activity owner' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async stopActivity(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') activityId: string,
    @Body() dto: StopActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.stopActivity(user.id, activityId, dto);
  }

  /**
   * GET /activities/:id
   * Retrieve single activity with full data
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get activity details by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully', type: Activity })
  @ApiResponse({ status: 403, description: 'Not the activity owner' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async getActivity(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') activityId: string,
  ): Promise<Activity> {
    return this.activitiesService.getActivity(activityId, user.id);
  }

  /**
   * GET /activities
   * List user's activities with pagination and filtering
   * Query params: take, skip, type, fromDate, toDate
   */
  @Get()
  @ApiOperation({ summary: 'List user activities with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async listActivities(
    @CurrentUser() user: { id: string; email: string },
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('type') type?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const options: any = {
      take: take ? parseInt(take.toString()) : 20,
      skip: skip ? parseInt(skip.toString()) : 0,
    };

    if (type) {
      options.type = type;
    }

    if (fromDate) {
      options.fromDate = new Date(fromDate);
    }

    if (toDate) {
      options.toDate = new Date(toDate);
    }

    return this.activitiesService.getUserActivities(user.id, options);
  }

  /**
   * POST /activities/:id/gps-points
   * Batch submit GPS points for an activity
   */
  @Post(':id/gps-points')
  @ApiOperation({ summary: 'Submit batch of GPS points for an activity' })
  @ApiResponse({ status: 201, description: 'GPS points saved successfully', type: [GPSPoint] })
  @ApiResponse({ status: 400, description: 'Invalid GPS data' })
  @ApiResponse({ status: 403, description: 'Not the activity owner' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async submitGPSPoints(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') activityId: string,
    @Body() dto: BatchGPSPointsDto,
  ): Promise<GPSPoint[]> {
    return this.activitiesService.submitGPSPoints(user.id, activityId, dto);
  }

  /**
   * GET /activities/:id/gps-trace
   * Get complete GPS trace for an activity
   */
  @Get(':id/gps-trace')
  @ApiOperation({ summary: 'Retrieve complete GPS trace/route for an activity' })
  @ApiResponse({ status: 200, description: 'GPS trace retrieved successfully', type: [GPSPoint] })
  @ApiResponse({ status: 403, description: 'Not the activity owner' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async getGPSTrace(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') activityId: string,
  ): Promise<GPSPoint[]> {
    return this.activitiesService.getActivityGPSTrace(activityId, user.id);
  }

  /**
   * POST /activities/:id/segments
   * Record an activity segment (1km split, etc.)
   */
  @Post(':id/segments')
  @ApiOperation({ summary: 'Record an activity segment (e.g., 1km split)' })
  @ApiResponse({ status: 201, description: 'Segment recorded successfully', type: ActivitySegment })
  @ApiResponse({ status: 400, description: 'Invalid segment data' })
  @ApiResponse({ status: 403, description: 'Not the activity owner' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async recordSegment(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') activityId: string,
    @Body() segment: any,
  ): Promise<ActivitySegment> {
    return this.activitiesService.recordSegment(user.id, activityId, segment);
  }

  /**
   * GET /activities/achievements/list
   * Get all achievements for current user
   */
  @Get('achievements/list')
  async getAchievements(
    @CurrentUser() user: { id: string; email: string },
  ): Promise<Achievement[]> {
    return this.activitiesService.getUserAchievements(user.id);
  }
}
