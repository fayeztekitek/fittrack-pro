import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'super_secret_access_key_123!'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY', '900s'),
    });

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    
    const user = await this.usersService.create(
      {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'user',
      },
      {
        weightKg: dto.weightKg,
        heightCm: dto.heightCm ?? 170,
        age: dto.age ?? 25,
        gender: dto.gender,
        stepGoal: dto.stepGoal ?? 10000,
      },
    );

    const tokens = await this.generateTokens(user);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.usersService.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user', 'user.profile'],
    });

    if (!tokenEntity || tokenEntity.revokedAt || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Mark current refresh token as revoked/rotated
    tokenEntity.revokedAt = new Date();
    await this.refreshTokenRepository.save(tokenEntity);

    // Generate new set of tokens
    const user = tokenEntity.user;
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (tokenEntity) {
      tokenEntity.revokedAt = new Date();
      await this.refreshTokenRepository.save(tokenEntity);
    }
  }

  async seedDemoAccount() {
    const demoEmail = 'demo@fit.com';
    const demoUser = await this.usersService.findByEmail(demoEmail);
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('demo123', 12);
      await this.usersService.create(
        {
          email: demoEmail,
          passwordHash,
          name: 'Demo Account',
          role: 'user',
        },
        {
          weightKg: 70.0,
          heightCm: 175,
          age: 30,
          gender: 'male' as any,
          stepGoal: 10000,
        },
      );
      console.log('Demo account seeded: demo@fit.com / demo123');
    }
  }
}
