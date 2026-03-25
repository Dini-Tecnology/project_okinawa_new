import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { Logger } from '@nestjs/common';

dotenvConfig();

const logger = new Logger('DatabaseConfig');

// Validate required environment variables for migrations
const requiredEnvVars = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  logger.warn(
    `Missing required database environment variables: ${missingVars.join(', ')}. ` +
    `Please configure your .env file based on .env.example`,
  );
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
