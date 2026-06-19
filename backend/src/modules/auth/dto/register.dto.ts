import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/entities/user-profile.entity';

export class RegisterDto {
  @ApiProperty({ example: 'Alice' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secure123', minLength: 6 })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsString()
  password: string;

  @ApiProperty({ example: 65.5 })
  @IsNumber()
  @Min(30, { message: 'Weight must be at least 30kg' })
  @Max(200, { message: 'Weight cannot exceed 200kg' })
  weightKg: number;

  @ApiProperty({ example: 170, required: false, default: 170 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(230)
  heightCm?: number;

  @ApiProperty({ example: 25, required: false, default: 25 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  age?: number;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE, required: false, default: Gender.OTHER })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 10000, required: false, default: 10000 })
  @IsOptional()
  @IsInt()
  @Min(3000)
  @Max(20000)
  stepGoal?: number;
}
