import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // App Feature Modules
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
