import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsISO8601, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GPSPointDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: 150, description: 'Elevation in meters', required: false })
  @IsOptional()
  @IsNumber()
  elevationM?: number;

  @ApiProperty({ example: 15.5, description: 'Speed in km/h', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speedKmh?: number;

  @ApiProperty({ example: 5.0, description: 'GPS accuracy in meters', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracyM?: number;

  @ApiProperty({ example: 180, description: 'Bearing/heading in degrees (0-360)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  bearingDegrees?: number;

  @ApiProperty({ example: '2026-06-20T10:30:00Z', description: 'ISO 8601 timestamp' })
  @IsISO8601()
  timestamp: string;
}

export class BatchGPSPointsDto {
  @ApiProperty({ type: [GPSPointDto], description: 'Array of GPS points' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GPSPointDto)
  points: GPSPointDto[];
}

export class ActivitySegmentDto {
  @IsNumber()
  segmentNumber: number;

  @IsNumber()
  @Min(0)
  durationSeconds: number;

  @IsNumber()
  @Min(0)
  distanceKm: number;

  @IsNumber()
  @Min(0)
  avgSpeedKmh: number;

  @IsOptional()
  @IsNumber()
  avgPowerWatts?: number;

  @IsOptional()
  @IsNumber()
  maxPowerWatts?: number;

  @IsOptional()
  @IsNumber()
  avgCadenceRpm?: number;

  @IsNumber()
  @Min(0)
  caloriesBurned: number;

  @IsOptional()
  @IsNumber()
  elevationGainM?: number;

  @IsISO8601()
  startedAt: string;

  @IsISO8601()
  endedAt: string;
}
