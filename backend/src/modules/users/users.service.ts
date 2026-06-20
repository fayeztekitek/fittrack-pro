import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['profile'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async create(
    userFields: Partial<User>,
    profileFields: Partial<UserProfile>,
  ): Promise<User> {
    const user = this.userRepository.create({
      ...userFields,
      email: userFields.email.toLowerCase().trim(),
    });

    const profile = this.profileRepository.create(profileFields);
    user.profile = profile;

    return this.userRepository.save(user);
  }

  async updateProfile(
    userId: string,
    profileFields: Partial<UserProfile>,
  ): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = this.profileRepository.create({ ...profileFields, userId });
    } else {
      Object.assign(profile, profileFields);
    }

    return this.profileRepository.save(profile);
  }

  async updateName(userId: string, name: string): Promise<void> {
    await this.userRepository.update(userId, { name });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }
}
