import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: { id: string; email: string }) {
    const full = await this.usersService.findById(user.id);
    return {
      id: full.id,
      name: full.name,
      email: full.email,
      role: full.role,
      profile: full.profile,
    };
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const { name, ...profileFields } = dto;

    if (name) {
      await this.usersService.updateName(user.id, name);
    }

    const hasProfileFields = Object.keys(profileFields).length > 0;
    if (hasProfileFields) {
      await this.usersService.updateProfile(user.id, profileFields);
    }

    const full = await this.usersService.findById(user.id);
    return {
      id: full.id,
      name: full.name,
      email: full.email,
      role: full.role,
      profile: full.profile,
    };
  }
}
