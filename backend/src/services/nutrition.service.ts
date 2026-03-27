import { Repository } from 'typeorm';
import { NutritionLog, MealType } from '../models/nutrition.model';
import { AppError } from '../middlewares/error.middleware';

export interface CreateNutritionLogInput {
  userId: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: number;
  unit?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  notes?: string;
  loggedAt?: Date;
}

export interface NutritionFilters {
  userId: string;
  mealType?: MealType;
  startDate?: Date;
  endDate?: Date;
}

export class NutritionService {
  constructor(private nutritionLogRepository: Repository<NutritionLog>) {}

  async createLog(input: CreateNutritionLogInput): Promise<NutritionLog> {
    const log = this.nutritionLogRepository.create(input);
    return await this.nutritionLogRepository.save(log);
  }

  async getLogs(filters: NutritionFilters): Promise<NutritionLog[]> {
    const { userId, mealType, startDate, endDate } = filters;

    const query = this.nutritionLogRepository.createQueryBuilder('log')
      .where('log.userId = :userId', { userId });

    if (mealType) {
      query.andWhere('log.mealType = :mealType', { mealType });
    }

    if (startDate) {
      query.andWhere('log.loggedAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('log.loggedAt <= :endDate', { endDate });
    }

    return await query.orderBy('log.loggedAt', 'DESC').getMany();
  }

  async getDailySummary(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const logs = await this.nutritionLogRepository.find({
      where: {
        userId,
        loggedAt: { between: startOfDay, endOfDay },
      },
    });

    const summary = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbohydrates: acc.carbohydrates + (log.carbohydrates || 0),
        fat: acc.fat + (log.fat || 0),
        fiber: acc.fiber + (log.fiber || 0),
        sugar: acc.sugar + (log.sugar || 0),
        sodium: acc.sodium + (log.sodium || 0),
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    return {
      date,
      totalLogs: logs.length,
      summary,
      meals: {
        breakfast: logs.filter((l) => l.mealType === MealType.BREAKFAST),
        lunch: logs.filter((l) => l.mealType === MealType.LUNCH),
        dinner: logs.filter((l) => l.mealType === MealType.DINNER),
        snack: logs.filter((l) => l.mealType === MealType.SNACK),
      },
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
    const log = await this.nutritionLogRepository.findOne({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new AppError(404, 'Nutrition log not found');
    }

    await this.nutritionLogRepository.remove(log);
  }

  async updateLog(
    logId: string,
    userId: string,
    updates: Partial<CreateNutritionLogInput>
  ): Promise<NutritionLog> {
    const log = await this.nutritionLogRepository.findOne({
      where: { id: logId, userId },
    });

    if (!log) {
      throw new AppError(404, 'Nutrition log not found');
    }

    Object.assign(log, updates);
    return await this.nutritionLogRepository.save(log);
  }

  async getNutritionStats(userId: string): Promise<any> {
    const logs = await this.nutritionLogRepository.find({ where: { userId } });

    const stats = logs.reduce(
      (acc, log) => ({
        totalCalories: acc.totalCalories + (log.calories || 0),
        totalProtein: acc.totalProtein + (log.protein || 0),
        totalCarbs: acc.totalCarbs + (log.carbohydrates || 0),
        totalFat: acc.totalFat + (log.fat || 0),
        avgCaloriesPerDay: 0,
        avgProteinPerDay: 0,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, avgCaloriesPerDay: 0, avgProteinPerDay: 0 }
    );

    return stats;
  }
}
