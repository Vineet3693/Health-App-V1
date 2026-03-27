import { HealthStatus } from './common.interface';

export interface IVitals {
  heartRate?: number; // bpm
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  temperature?: number; // celsius or fahrenheit
  oxygenSaturation?: number; // percentage
  respiratoryRate?: number; // breaths per minute
  glucoseLevel?: number; // mg/dL
  weight?: number; // kg or lbs
  height?: number; // cm or ft
  bmi?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  boneDensity?: number;
  waterPercentage?: number;
}

export interface IHealthRecord {
  id: string;
  userId: string;
  vitals: IVitals;
  symptoms?: ISymptom[];
  notes?: string;
  attachments?: string[];
  status: HealthStatus;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISymptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration?: string;
  notes?: string;
}

export interface ISleepRecord {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  quality: number; // 0-100
  stages: {
    light: number; // minutes
    deep: number; // minutes
    rem: number; // minutes
    awake: number; // minutes
  };
  disturbances?: number;
  notes?: string;
  recordedAt: Date;
}

export interface IWaterIntake {
  id: string;
  userId: string;
  amount: number; // ml
  timestamp: Date;
  type?: 'water' | 'coffee' | 'tea' | 'juice' | 'other';
}

export interface IMedication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  reminders: IMedicationReminder[];
  isActive: boolean;
}

export interface IMedicationReminder {
  id: string;
  time: string; // HH:mm format
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  isTaken: boolean;
  takenAt?: Date;
  skippedAt?: Date;
}
