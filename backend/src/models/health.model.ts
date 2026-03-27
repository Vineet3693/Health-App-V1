import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.model';

export enum VitalType {
  HEART_RATE = 'heart_rate',
  BLOOD_PRESSURE = 'blood_pressure',
  TEMPERATURE = 'temperature',
  OXYGEN_SATURATION = 'oxygen_saturation',
  GLUCOSE = 'glucose',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi'
}

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.healthRecords)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: VitalType })
  type: VitalType;

  @Column({ type: 'float' })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}