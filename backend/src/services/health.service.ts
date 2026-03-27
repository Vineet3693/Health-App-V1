import { Repository } from 'typeorm';
import { HealthRecord, VitalType } from '../models/health.model';
import { AppError } from '../middlewares/error.middleware';

export interface CreateHealthRecordInput {
  userId: string;
  type: VitalType;
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
  notes?: string;
  recordedAt?: Date;
}

export interface HealthRecordFilters {
  userId: string;
  type?: VitalType;
  startDate?: Date;
  endDate?: Date;
}

export class HealthService {
  constructor(private healthRecordRepository: Repository<HealthRecord>) {}

  async createRecord(input: CreateHealthRecordInput): Promise<HealthRecord> {
    const record = this.healthRecordRepository.create(input);
    return await this.healthRecordRepository.save(record);
  }

  async getRecords(filters: HealthRecordFilters): Promise<HealthRecord[]> {
    const { userId, type, startDate, endDate } = filters;

    const query = this.healthRecordRepository.createQueryBuilder('record')
      .where('record.userId = :userId', { userId });

    if (type) {
      query.andWhere('record.type = :type', { type });
    }

    if (startDate) {
      query.andWhere('record.recordedAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('record.recordedAt <= :endDate', { endDate });
    }

    return await query.orderBy('record.recordedAt', 'DESC').getMany();
  }

  async getLatestRecord(userId: string, type: VitalType): Promise<HealthRecord | null> {
    return await this.healthRecordRepository.findOne({
      where: { userId, type },
      order: { recordedAt: 'DESC' },
    });
  }

  async getRecordsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthRecord[]> {
    return await this.healthRecordRepository.find({
      where: {
        userId,
        recordedAt: { between: startDate, endDate },
      },
      order: { recordedAt: 'ASC' },
    });
  }

  async deleteRecord(recordId: string, userId: string): Promise<void> {
    const record = await this.healthRecordRepository.findOne({
      where: { id: recordId, userId },
    });

    if (!record) {
      throw new AppError(404, 'Health record not found');
    }

    await this.healthRecordRepository.remove(record);
  }

  async getHealthStats(userId: string): Promise<any> {
    const records = await this.healthRecordRepository.find({
      where: { userId },
    });

    const stats: Record<string, any> = {};

    records.forEach((record) => {
      if (!stats[record.type]) {
        stats[record.type] = {
          count: 0,
          min: record.value,
          max: record.value,
          sum: 0,
          values: [],
        };
      }

      stats[record.type].count++;
      stats[record.type].min = Math.min(stats[record.type].min, record.value);
      stats[record.type].max = Math.max(stats[record.type].max, record.value);
      stats[record.type].sum += record.value;
      stats[record.type].values.push(record.value);
    });

    Object.keys(stats).forEach((key) => {
      stats[key].avg = stats[key].sum / stats[key].count;
    });

    return stats;
  }

  async bulkCreateRecords(records: CreateHealthRecordInput[]): Promise<HealthRecord[]> {
    const createdRecords = records.map((r) => this.healthRecordRepository.create(r));
    return await this.healthRecordRepository.save(createdRecords);
  }
}
