import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

export class IntegrationSetup {
  postgresContainer!: StartedPostgreSqlContainer;
  redisContainer!: StartedRedisContainer;

  async start(): Promise<void> {
    this.postgresContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('fittrack_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    this.redisContainer = await new RedisContainer('redis:7-alpine').start();

    process.env.DB_HOST = this.postgresContainer.getHost();
    process.env.DB_PORT = String(this.postgresContainer.getMappedPort(5432));
    process.env.DB_USERNAME = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'fittrack_test';
    process.env.REDIS_HOST = this.redisContainer.getHost();
    process.env.REDIS_PORT = String(this.redisContainer.getMappedPort(6379));
    process.env.JWT_ACCESS_SECRET = 'integration-test-secret';
    process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '30d';
  }

  get dbConfig() {
    return {
      host: this.postgresContainer.getHost(),
      port: this.postgresContainer.getMappedPort(5432),
      username: 'test',
      password: 'test',
      database: 'fittrack_test',
    };
  }

  get redisConfig() {
    return {
      host: this.redisContainer.getHost(),
      port: this.redisContainer.getMappedPort(6379),
    };
  }

  async stop(): Promise<void> {
    await Promise.all([
      this.postgresContainer.stop(),
      this.redisContainer.stop(),
    ]);
  }
}
