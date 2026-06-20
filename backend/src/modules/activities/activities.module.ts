import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { ActivitySegment } from './entities/activity-segment.entity';
import { GPSPoint } from './entities/gps-point.entity';
import { Achievement } from './entities/achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivitySegment,
      GPSPoint,
      Achievement,
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
