import axios from 'axios';

export interface HealthPredictionInput {
  age: number;
  gender: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bmi: number;
  glucoseLevel: number;
  activityLevel: number;
}

export interface FoodRecognitionResult {
  foodName: string;
  confidence: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface SleepAnalysisResult {
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  sleepScore: number;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  remSleepMinutes: number;
  awakeMinutes: number;
  recommendations: string[];
}

export interface Recommendation {
  type: 'nutrition' | 'fitness' | 'health';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export class MLService {
  private mlApiUrl: string;

  constructor() {
    this.mlApiUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000/api';
  }

  async predictHealthRisk(input: HealthPredictionInput): Promise<{ riskScore: number; riskLevel: string; factors: string[] }> {
    try {
      // In production, this would call the ML service
      // For now, we'll use a simple heuristic
      let riskScore = 0;
      const factors: string[] = [];

      // BMI factor
      if (input.bmi > 30) {
        riskScore += 20;
        factors.push('High BMI');
      } else if (input.bmi > 25) {
        riskScore += 10;
        factors.push('Elevated BMI');
      }

      // Blood pressure factor
      if (input.bloodPressureSystolic > 140 || input.bloodPressureDiastolic > 90) {
        riskScore += 25;
        factors.push('High blood pressure');
      }

      // Glucose factor
      if (input.glucoseLevel > 126) {
        riskScore += 20;
        factors.push('Elevated glucose level');
      }

      // Heart rate factor
      if (input.heartRate > 100 || input.heartRate < 60) {
        riskScore += 10;
        factors.push('Abnormal heart rate');
      }

      // Activity level factor
      if (input.activityLevel < 3) {
        riskScore += 15;
        factors.push('Low activity level');
      }

      let riskLevel = 'low';
      if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'moderate';

      return { riskScore: Math.min(100, riskScore), riskLevel, factors };
    } catch (error) {
      console.error('ML prediction error:', error);
      throw new Error('Failed to predict health risk');
    }
  }

  async recognizeFood(imageUrl: string): Promise<FoodRecognitionResult[]> {
    try {
      // Call ML service for food recognition
      const response = await axios.post(`${this.mlApiUrl}/recognize-food`, { imageUrl });
      return response.data.results;
    } catch (error) {
      console.error('Food recognition error:', error);
      // Return mock data for development
      return [
        {
          foodName: 'Sample Food',
          confidence: 0.95,
          calories: 250,
          protein: 15,
          carbohydrates: 30,
          fat: 8,
        },
      ];
    }
  }

  async analyzeSleep(sleepData: { duration: number; disturbances: number; deepSleepRatio: number }): Promise<SleepAnalysisResult> {
    try {
      const { duration, disturbances, deepSleepRatio } = sleepData;
      
      let sleepScore = 0;
      let sleepQuality: SleepAnalysisResult['sleepQuality'] = 'poor';

      // Duration scoring (optimal: 7-9 hours)
      if (duration >= 420 && duration <= 540) {
        sleepScore += 40;
      } else if (duration >= 360 && duration <= 600) {
        sleepScore += 25;
      } else {
        sleepScore += 10;
      }

      // Disturbances scoring
      if (disturbances === 0) {
        sleepScore += 30;
      } else if (disturbances <= 2) {
        sleepScore += 20;
      } else if (disturbances <= 5) {
        sleepScore += 10;
      }

      // Deep sleep ratio scoring
      if (deepSleepRatio >= 0.2) {
        sleepScore += 30;
      } else if (deepSleepRatio >= 0.15) {
        sleepScore += 20;
      } else if (deepSleepRatio >= 0.1) {
        sleepScore += 10;
      }

      if (sleepScore >= 80) sleepQuality = 'excellent';
      else if (sleepScore >= 60) sleepQuality = 'good';
      else if (sleepScore >= 40) sleepQuality = 'fair';

      const recommendations: string[] = [];
      if (duration < 420) recommendations.push('Try to get 7-9 hours of sleep');
      if (disturbances > 3) recommendations.push('Reduce noise and light in your bedroom');
      if (deepSleepRatio < 0.15) recommendations.push('Avoid caffeine before bedtime');

      return {
        sleepQuality,
        sleepScore,
        deepSleepMinutes: Math.floor(duration * deepSleepRatio),
        lightSleepMinutes: Math.floor(duration * 0.5),
        remSleepMinutes: Math.floor(duration * 0.25),
        awakeMinutes: Math.floor(duration * (1 - deepSleepRatio - 0.5 - 0.25)),
        recommendations,
      };
    } catch (error) {
      console.error('Sleep analysis error:', error);
      throw new Error('Failed to analyze sleep data');
    }
  }

  async getRecommendations(userId: string, healthData: any): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Generate personalized recommendations based on health data
    if (healthData.avgCaloriesPerDay > 2500) {
      recommendations.push({
        type: 'nutrition',
        title: 'Reduce Calorie Intake',
        description: 'Your average daily calorie intake is above recommended levels.',
        priority: 'high',
      });
    }

    if (healthData.weeklyWorkouts < 3) {
      recommendations.push({
        type: 'fitness',
        title: 'Increase Physical Activity',
        description: 'Aim for at least 3 workouts per week for better health.',
        priority: 'high',
      });
    }

    if (healthData.waterIntakePerDay < 2) {
      recommendations.push({
        type: 'health',
        title: 'Stay Hydrated',
        description: 'Try to drink at least 2 liters of water daily.',
        priority: 'medium',
      });
    }

    return recommendations;
  }
}
