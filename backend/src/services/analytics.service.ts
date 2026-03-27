import { HealthRecord, VitalType } from '../models/health.model';
import { NutritionLog, MealType } from '../models/nutrition.model';
import { FitnessLog, ExerciseType } from '../models/fitness.model';

export interface HealthTrend {
  type: VitalType;
  data: { date: string; value: number }[];
  trend: 'up' | 'down' | 'stable';
  average: number;
}

export class AnalyticsService {
  async calculateHealthScore(
    healthRecords: HealthRecord[],
    nutritionLogs: NutritionLog[],
    fitnessLogs: FitnessLog[]
  ): Promise<number> {
    let score = 50; // Base score

    // Health metrics contribution (max 30 points)
    if (healthRecords.length > 0) {
      const recentRecords = healthRecords.filter(
        (r) => new Date(r.recordedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      score += Math.min(30, recentRecords.length * 3);
    }

    // Nutrition tracking contribution (max 20 points)
    if (nutritionLogs.length > 0) {
      const recentLogs = nutritionLogs.filter(
        (l) => new Date(l.loggedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      score += Math.min(20, recentLogs.length * 2);
    }

    // Fitness contribution (max 20 points)
    if (fitnessLogs.length > 0) {
      const recentWorkouts = fitnessLogs.filter(
        (l) => new Date(l.performedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      score += Math.min(20, recentWorkouts.length * 4);
    }

    return Math.min(100, Math.max(0, score));
  }

  async getHealthTrends(records: HealthRecord[]): Promise<HealthTrend[]> {
    const trends: HealthTrend[] = [];
    const types = Array.from(new Set(records.map((r) => r.type)));

    for (const type of types) {
      const typeRecords = records
        .filter((r) => r.type === type)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

      if (typeRecords.length < 2) continue;

      const data = typeRecords.map((r) => ({
        date: new Date(r.recordedAt).toISOString().split('T')[0],
        value: r.value,
      }));

      const values = typeRecords.map((r) => r.value);
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      // Calculate trend
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondAvg > firstAvg * 1.05) trend = 'up';
      else if (secondAvg < firstAvg * 0.95) trend = 'down';

      trends.push({ type, data, trend, average });
    }

    return trends;
  }

  async getActivityStreak(fitnessLogs: FitnessLog[]): Promise<number> {
    if (fitnessLogs.length === 0) return 0;

    const sortedLogs = [...fitnessLogs].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = today;

    for (const log of sortedLogs) {
      const logDate = new Date(log.performedAt);
      logDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  }

  async generateWeeklyReport(
    userId: string,
    healthRecords: HealthRecord[],
    nutritionLogs: NutritionLog[],
    fitnessLogs: FitnessLog[]
  ): Promise<any> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyHealthRecords = healthRecords.filter((r) => new Date(r.recordedAt) > weekAgo);
    const weeklyNutritionLogs = nutritionLogs.filter((l) => new Date(l.loggedAt) > weekAgo);
    const weeklyFitnessLogs = fitnessLogs.filter((l) => new Date(l.performedAt) > weekAgo);

    const totalCalories = weeklyNutritionLogs.reduce((acc, l) => acc + (l.calories || 0), 0);
    const totalCaloriesBurned = weeklyFitnessLogs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);
    const totalWorkoutDuration = weeklyFitnessLogs.reduce((acc, l) => acc + (l.duration || 0), 0);

    return {
      userId,
      period: { start: weekAgo, end: new Date() },
      summary: {
        healthRecordsCount: weeklyHealthRecords.length,
        mealsLogged: weeklyNutritionLogs.length,
        workoutsCompleted: weeklyFitnessLogs.length,
        totalCaloriesConsumed: totalCalories,
        totalCaloriesBurned: totalCaloriesBurned,
        totalWorkoutMinutes: totalWorkoutDuration,
      },
      healthScore: await this.calculateHealthScore(weeklyHealthRecords, weeklyNutritionLogs, weeklyFitnessLogs),
      streak: await this.getActivityStreak(weeklyFitnessLogs),
    };
  }
}
