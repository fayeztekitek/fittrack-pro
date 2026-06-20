import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ProfileModule } from './modules/profile/profile.module';
import { StatsModule } from './modules/stats/stats.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM asynchronously with database environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'fittrack_user'),
        password: configService.get<string>('DB_PASSWORD', 'fittrack_password'),
        database: configService.get<string>('DB_NAME', 'fittrack_db'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development', // Synchronize only in development
      }),
    }),

    // Global Rate Limiting: max 100 requests per 60 seconds
    // For horizontal scaling, replace with Redis-backed storage
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 100,
      }],
    }),

    // Redis client + Audit (global modules)
    RedisModule,
    AuditModule,

    // App Feature Modules
    UsersModule,
    AuthModule,
    ActivitiesModule,
    ProfileModule,
    StatsModule,
  ],
})
export class AppModule {}
