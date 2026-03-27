import { HealthStatus } from './common.interface';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  locale?: string;
  healthScore?: number;
  healthStatus?: HealthStatus;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface IUserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    shareHealthData: boolean;
    shareActivityData: boolean;
  };
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    temperature: 'celsius' | 'fahrenheit';
    distance: 'km' | 'miles';
  };
  goals: {
    dailyCalories?: number;
    dailySteps?: number;
    dailyWater?: number;
    sleepHours?: number;
    workoutDaysPerWeek?: number;
  };
}

export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  healthScore?: number;
  memberSince: Date;
  stats: {
    totalWorkouts: number;
    totalMeals: number;
    totalAppointments: number;
    streakDays: number;
  };
}
