import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { Activity, ActivityType } from '../activities/entities/activity.entity';
import { Repository, Between } from 'typeorm';

describe('StatsService', () => {
  let service: StatsService;
  let activityRepository: jest.Mocked<Repository<Activity>>;

  const mockActivities: Partial<Activity>[] = [
    {
      id: '1',
      userId: 'user-uuid',
      type: ActivityType.RUNNING,
      startedAt: new Date('2024-06-20T08:00:00Z'),
      durationSeconds: 1800,
      distanceKm: 5.2,
      caloriesBurned: 350,
      totalSteps: 5200,
      maxSpeedKmh: 12.5,
      avgSpeedKmh: 10.4,
    },
    {
      id: '2',
      userId: 'user-uuid',
      type: ActivityType.CYCLING,
      startedAt: new Date('2024-06-19T10:00:00Z'),
      durationSeconds: 3600,
      distanceKm: 25.0,
      caloriesBurned: 520,
      totalSteps: 0,
      maxSpeedKmh: 35.0,
      avgSpeedKmh: 25.0,
      avgPowerWatts: 185,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    activityRepository = module.get(getRepositoryToken(Activity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailyStats', () => {
    it('should aggregate today activities', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      (activityRepository.find as jest.Mock).mockResolvedValue(
        mockActivities.filter(
          (a) =>
            a.startedAt! >= today && a.startedAt! < tomorrow,
        ),
      );

      const result = await service.getDailyStats('user-uuid');
      expect(activityRepository.find).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid',
          startedAt: Between(today, tomorrow),
        },
      });
      expect(result).toHaveProperty('totalSteps');
      expect(result).toHaveProperty('totalDistanceKm');
      expect(result).toHaveProperty('totalCaloriesKcal');
    });
  });

  describe('getWeeklyStats', () => {
    it('should return 7-day breakdown', async () => {
      (activityRepository.find as jest.Mock).mockResolvedValue(
        mockActivities,
      );

      const result = await service.getWeeklyStats('user-uuid');
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('totals');
      expect(result.days.length).toBeLessThanOrEqual(7);
    });
  });

  describe('getStreak', () => {
    it('should compute consecutive-day streak', async () => {
      (activityRepository.find as jest.Mock).mockResolvedValue(
        mockActivities,
      );

      const result = await service.getStreak('user-uuid');
      expect(result).toHaveProperty('streak');
      expect(typeof result.streak).toBe('number');
    });

    it('should return 0 for no activities', async () => {
      (activityRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getStreak('user-uuid');
      expect(result.streak).toBe(0);
    });
  });

  describe('getActivityBreakdown', () => {
    it('should return type distribution', async () => {
      (activityRepository.find as jest.Mock).mockResolvedValue(
        mockActivities,
      );

      const result = await service.getActivityBreakdown('user-uuid');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('percentage');
    });
  });
});
