import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import { HealthRecord } from '../models/health.model';
import { NutritionLog } from '../models/nutrition.model';
import { FitnessLog } from '../models/fitness.model';
import { Appointment } from '../models/appointment.model';
import { Doctor } from '../models/doctor.model';
import { Subscription } from '../models/subscription.model';
import { logger } from '../utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'health_app',
  entities: [
    User,
    HealthRecord,
    NutritionLog,
    FitnessLog,
    Appointment,
    Doctor,
    Subscription,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default AppDataSource;
