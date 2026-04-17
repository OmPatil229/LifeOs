import { DistractionLog } from '../entities/DistractionLog.js';

export interface IDistractionLogRepository {
  findById(id: string): Promise<DistractionLog | null>;
  findByUserIdAndDate(userId: string, date: string): Promise<DistractionLog[]>;
  create(log: Partial<DistractionLog>): Promise<DistractionLog>;
  getDailyTotalMinutes(userId: string, date: string): Promise<number>;
  getWeeklyLossHours(userId: string, fromDate: string, toDate: string): Promise<number>;
}
