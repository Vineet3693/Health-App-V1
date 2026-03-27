import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from './app.config';

const dbConfig = appConfig.database;

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
  entities: ['src/models/*.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
  poolSize: dbConfig.poolSize,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(databaseConfig);
