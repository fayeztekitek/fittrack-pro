import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;
  let refreshTokenRepository: any;

  const mockUser = {
    id: 'user-uuid',
    name: 'Alice',
    email: 'alice@example.com',
    passwordHash: 'hashed_pass_123',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    profile: {
      id: 'profile-uuid',
      userId: 'user-uuid',
      weightKg: 65,
      heightCm: 170,
      age: 25,
      gender: 'female',
      stepGoal: 10000,
      updatedAt: new Date(),
    },
  };

  const mockRefreshTokenRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'token-uuid', ...entity })),
    findOne: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-access-token'),
    };

    configService = {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);

      const dto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secure123',
        weightKg: 65,
      };

      const result = await service.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.name).toEqual('Alice');
    });

    it('should throw ConflictException if email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      const dto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secure123',
        weightKg: 65,
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully validate password and login user', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const dto = {
        email: 'alice@example.com',
        password: 'secure123',
      };

      const result = await service.login(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for incorrect email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const dto = {
        email: 'wrong@example.com',
        password: 'secure123',
      };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const dto = {
        email: 'alice@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
