import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Gender } from '../../users/entities/user-profile.entity';

export class UpdateProfileDto {
  @ApiProperty({ example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weightKg?: number;

  @ApiProperty({ example: 175, required: false })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(230)
  heightCm?: number;

  @ApiProperty({ example: 28, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  age?: number;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 12000, required: false })
  @IsOptional()
  @IsInt()
  @Min(3000)
  @Max(20000)
  stepGoal?: number;

  @ApiProperty({ example: 'Alice', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
