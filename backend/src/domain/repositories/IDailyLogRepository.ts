import { DailyLog, SystemStatus } from '../entities/DailyLog.js';

export interface IDailyLogRepository {
  findByUserIdAndDate(userId: string, date: string): Promise<DailyLog | null>;
  upsert(userId: string, date: string, log: Partial<DailyLog>): Promise<DailyLog>;
  findByUserIdAndDateRange(userId: string, fromDate: string, toDate: string): Promise<DailyLog[]>;
  updateStatus(userId: string, date: string, status: SystemStatus, recoveryModeActive: boolean): Promise<DailyLog | null>;
  getAverageMood(userId: string, fromDate: string, toDate: string): Promise<number>;
  getAverageEnergy(userId: string, fromDate: string, toDate: string): Promise<number>;
}
