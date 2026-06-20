import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';

export class StartActivityDto {
  @ApiProperty({ example: 'running', description: 'Type of activity', enum: ['walking', 'fast_walking', 'running', 'cycling'] })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 150, description: 'Starting elevation in meters', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elevationStartM?: number;

  @ApiProperty({ example: 'Morning run', description: 'Activity notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StopActivityDto {
  @ApiProperty({ example: 1800, description: 'Duration in seconds' })
  @IsNumber()
  @Min(0)
  durationSeconds: number;

  @ApiProperty({ example: 5.2, description: 'Distance covered in kilometers' })
  @IsNumber()
  @Min(0)
  distanceKm: number;

  @ApiProperty({ example: 450, description: 'Calories burned' })
  @IsNumber()
  @Min(0)
  caloriesBurned: number;

  @ApiProperty({ example: 5000, description: 'Total steps taken' })
  @IsNumber()
  @Min(0)
  totalSteps: number;

  @ApiProperty({ example: 18.5, description: 'Maximum speed in km/h' })
  @IsNumber()
  @Min(0)
  maxSpeedKmh: number;

  @ApiProperty({ example: 10.4, description: 'Average speed in km/h' })
  @IsNumber()
  @Min(0)
  avgSpeedKmh: number;

  @ApiProperty({ example: 120, description: 'Elevation gain in meters', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elevationGainM?: number;

  @ApiProperty({ example: 165, description: 'Maximum heart rate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(220)
  maxHeartRate?: number;

  @ApiProperty({ example: 140, description: 'Average heart rate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(220)
  avgHeartRate?: number;

  @ApiProperty({ example: 250, description: 'Average power in watts (for cycling)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgPowerWatts?: number;

  @ApiProperty({ example: 450, description: 'Maximum power in watts (for cycling)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPowerWatts?: number;

  @ApiProperty({ example: 95, description: 'Average cadence in RPM (for cycling)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgCadenceRpm?: number;

  @ApiProperty({ example: { weather: 'sunny', route: 'downtown' }, description: 'Custom metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class PauseActivityDto {
  @IsNumber()
  @Min(0)
  elapsedSeconds: number;
}
