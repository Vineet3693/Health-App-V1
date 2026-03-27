import { Repository } from 'typeorm';
import { FitnessLog, ExerciseType } from '../models/fitness.model';
import { AppError } from '../middlewares/error.middleware';

export interface CreateFitnessLogInput {
  userId: string;
  exerciseName: string;
  type?: ExerciseType;
  duration?: number;
  distance?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  caloriesBurned?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  metadata?: Record<string, any>;
  notes?: string;
  performedAt?: Date;
}

export interface FitnessFilters {
  userId: string;
  type?: ExerciseType;
  startDate?: Date;
  endDate?: Date;
}

export class FitnessService {
  constructor(private fitnessLogRepository: Repository<FitnessLog>) {}

  async createLog(input: CreateFitnessLogInput): Promise<FitnessLog> {
    const log = this.fitnessLogRepository.create(input);
    return await this.fitnessLogRepository.save(log);
  }

  async getLogs(filters: FitnessFilters): Promise<FitnessLog[]> {
    const { userId, type, startDate, endDate } = filters;

    const query = this.fitnessLogRepository.createQueryBuilder('log')
      .where('log.userId = :userId', { userId });

    if (type) {
      query.andWhere('log.type = :type', { type });
    }

    if (startDate) {
      query.andWhere('log.performedAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.performedAt <= :endDate', { endDate });
    }

    return await query.orderBy('log.performedAt', 'DESC').getMany();
  }

  async getDailySummary(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const logs = await this.fitnessLogRepository.find({
      where: {
        userId,
        performedAt: { between: startOfDay, endOfDay },
      },
    });

    const summary = logs.reduce(
      (acc, log) => ({
        totalDuration: acc.totalDuration + (log.duration || 0),
        totalDistance: acc.totalDistance + (log.distance || 0),
        totalCaloriesBurned: acc.totalCaloriesBurned + (log.caloriesBurned || 0),
        totalSets: acc.totalSets + (log.sets || 0),
        totalReps: acc.totalReps + (log.reps || 0),
      }),
      { totalDuration: 0, totalDistance: 0, totalCaloriesBurned: 0, totalSets: 0, totalReps: 0 }
    );

    return {
      date,
      totalLogs: logs.length,
      summary,
      exercisesByType: logs.reduce((acc, log) => {
        if (!acc[log.type]) {
          acc[log.type] = [];
        }
        acc[log.type].push(log);
        return acc;
      }, {} as Record<ExerciseType, FitnessLog[]>),
    };
  }

  async getWeeklySummary(userId: string, weekStart: Date): Promise<any[]> {
    const summaries = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const summary = await this.getDailySummary(userId, date);
      summaries.push(summary);
    }
    return summaries;
  }

  async deleteLog(logId: string, userId: string): Promise<void> {
    const log = await this.fitnessLogRepository.findOne({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new AppError(404, 'Fitness log not found');
    }

    await this.fitnessLogRepository.remove(log);
  }

  async updateLog(
    logId: string,
    userId: string,
    updates: Partial<CreateFitnessLogInput>
  ): Promise<FitnessLog> {
    const log = await this.fitnessLogRepository.findOne({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new AppError(404, 'Fitness log not found');
    }

    Object.assign(log, updates);
    return await this.fitnessLogRepository.save(log);
  }

  async getFitnessStats(userId: string): Promise<any> {
    const logs = await this.fitnessLogRepository.find({ where: { userId } });

    const stats = logs.reduce(
      (acc, log) => ({
        totalWorkouts: acc.totalWorkouts + 1,
        totalDuration: acc.totalDuration + (log.duration || 0),
        totalDistance: acc.totalDistance + (log.distance || 0),
        totalCaloriesBurned: acc.totalCaloriesBurned + (log.caloriesBurned || 0),
        avgDuration: 0,
        avgCaloriesPerWorkout: 0,
      }),
      { totalWorkouts: 0, totalDuration: 0, totalDistance: 0, totalCaloriesBurned: 0, avgDuration: 0, avgCaloriesPerWorkout: 0 }
    );

    if (stats.totalWorkouts > 0) {
      stats.avgDuration = stats.totalDuration / stats.totalWorkouts;
      stats.avgCaloriesPerWorkout = stats.totalCaloriesBurned / stats.totalWorkouts;
    }

    return stats;
  }

  async getExerciseFrequency(userId: string): Promise<any> {
    const logs = await this.fitnessLogRepository.find({ where: { userId } });

    const frequency = logs.reduce((acc, log) => {
      if (!acc[log.exerciseName]) {
        acc[log.exerciseName] = { count: 0, type: log.type };
      }
      acc[log.exerciseName].count++;
      return acc;
    }, {} as Record<string, { count: number; type: ExerciseType }>);

    return Object.entries(frequency)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }
}
