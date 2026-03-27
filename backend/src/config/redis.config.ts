import { RedisOptions } from 'ioredis';
import appConfig from './app.config';

const redisConfig = appConfig.redis;

export const redisOptions: RedisOptions = {
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password || undefined,
  db: redisConfig.db,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export default redisOptions;
