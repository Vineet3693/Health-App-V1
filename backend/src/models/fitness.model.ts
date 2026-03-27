import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.model';

export enum ExerciseType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  SPORTS = 'sports',
  OTHER = 'other'
}

@Entity('fitness_logs')
export class FitnessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.fitnessLogs)
  user: User;

  @Column()
  userId: string;

  @Column()
  exerciseName: string;

  @Column({ type: 'enum', enum: ExerciseType, default: ExerciseType.OTHER })
  type: ExerciseType;

  @Column({ type: 'float', nullable: true })
  duration: number; // in minutes

  @Column({ type: 'float', nullable: true })
  distance: number; // in km

  @Column({ type: 'integer', nullable: true })
  sets: number;

  @Column({ type: 'float', nullable: true })
  reps: number;

  @Column({ type: 'float', nullable: true })
  weight: number; // in kg

  @Column({ type: 'float', default: 0 })
  caloriesBurned: number;

  @Column({ type: 'integer', nullable: true })
  heartRateAvg: number;

  @Column({ type: 'integer', nullable: true })
  heartRateMax: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}