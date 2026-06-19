import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: 'a-uuid-refresh-token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
