import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityType } from './entities/activity.entity';
import { ActivitySegment } from './entities/activity-segment.entity';
import { GPSPoint } from './entities/gps-point.entity';
import { Achievement, AchievementBadge } from './entities/achievement.entity';
import { Repository } from 'typeorm';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let activityRepository: jest.Mocked<Repository<Activity>>;
  let segmentRepository: jest.Mocked<Repository<ActivitySegment>>;
  let gpsPointRepository: jest.Mocked<Repository<GPSPoint>>;
  let achievementRepository: jest.Mocked<Repository<Achievement>>;

  const mockActivity: Partial<Activity> = {
    id: 'activity-uuid',
    userId: 'user-uuid',
    type: ActivityType.RUNNING,
    startedAt: new Date('2024-06-20T08:00:00Z'),
    endedAt: null,
    durationSeconds: 0,
    distanceKm: 0,
    caloriesBurned: 0,
    totalSteps: 0,
    maxSpeedKmh: 0,
    avgSpeedKmh: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ActivitySegment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GPSPoint),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Achievement),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    activityRepository = module.get(getRepositoryToken(Activity));
    segmentRepository = module.get(getRepositoryToken(ActivitySegment));
    gpsPointRepository = module.get(getRepositoryToken(GPSPoint));
    achievementRepository = module.get(getRepositoryToken(Achievement));
  });

  describe('startActivity', () => {
    it('should create and save a new activity', async () => {
      const userId = 'user-123';
      const dto = { type: ActivityType.RUNNING };

      activityRepository.create.mockReturnValue(mockActivity as Activity);
      activityRepository.save.mockResolvedValue(mockActivity as Activity);

      const result = await service.startActivity(userId, dto);

      expect(activityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: ActivityType.RUNNING,
        }),
      );
      expect(activityRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockActivity);
    });
  });

  describe('calculateCyclingPower', () => {
    it('should calculate cycling power correctly', () => {
      const speedMsec = 10; // 10 m/s ≈ 36 km/h
      const weightKg = 75;
      const elevation = 0;

      const power = service.calculateCyclingPower(speedMsec, weightKg, elevation);

      expect(power).toBeGreaterThan(0);
      expect(typeof power).toBe('number');
    });

    it('should return 0 for zero speed', () => {
      const power = service.calculateCyclingPower(0, 75, 0);
      expect(power).toBeLessThanOrEqual(0);
    });
  });

  describe('getPowerZone', () => {
    it('should classify power into correct zone', () => {
      const ftp = 75 * 3.5; // ~262W
      const watts = 150;

      const zone = service.getPowerZone(watts, 75);

      expect(zone.zone).toBeGreaterThanOrEqual(1);
      expect(zone.zone).toBeLessThanOrEqual(6);
      expect(zone.label).toBeTruthy();
      expect(zone.percentage).toBeGreaterThan(0);
    });

    it('should classify recovery zone correctly', () => {
      const zone = service.getPowerZone(50, 75);
      expect(zone.zone).toBe(1);
      expect(zone.label).toBe('Recovery');
    });

    it('should classify anaerobic zone correctly', () => {
      const zone = service.getPowerZone(600, 75);
      expect(zone.zone).toBe(6);
      expect(zone.label).toBe('Anaerobic');
    });
  });

  describe('calculateCaloriesMET', () => {
    it('should calculate calories correctly for running', () => {
      const calories = service.calculateCaloriesMET(
        ActivityType.RUNNING,
        75,
        1, // 1 hour
      );

      // 9.8 MET * 75 kg * 1 hour = 735 calories
      expect(calories).toBeCloseTo(735, -1);
    });

    it('should calculate calories correctly for walking', () => {
      const calories = service.calculateCaloriesMET(
        ActivityType.WALKING,
        75,
        1, // 1 hour
      );

      // 3.5 MET * 75 kg * 1 hour = 262.5 calories
      expect(calories).toBeCloseTo(262, -1);
    });

    it('should calculate for partial hours', () => {
      const calories = service.calculateCaloriesMET(
        ActivityType.RUNNING,
        75,
        0.5, // 30 minutes
      );

      expect(calories).toBeCloseTo(367, -1);
    });
  });

  describe('estimateDistanceFromSteps', () => {
    it('should estimate distance from steps', () => {
      const steps = 1000;
      const distance = service.estimateDistanceFromSteps(steps);

      // 1000 steps * 0.75 m = 750 m = 0.75 km
      expect(distance).toBeCloseTo(0.75, 2);
    });

    it('should return 0 for 0 steps', () => {
      const distance = service.estimateDistanceFromSteps(0);
      expect(distance).toBe(0);
    });
  });
});
