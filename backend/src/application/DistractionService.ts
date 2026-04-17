import { IDistractionLogRepository } from '../domain/repositories/IDistractionLogRepository.js';
import { DistractionLog } from '../domain/entities/DistractionLog.js';
import { DailyLogService } from './DailyLogService.js';

export class DistractionService {
  constructor(
    private readonly distractionRepository: IDistractionLogRepository,
    private readonly dailyLogService: DailyLogService
  ) {}

  /**
   * Logs a distraction period and updates the dashboard precomputed log.
   * This is part of the behavioral honest feedback system.
   */
  async logDistraction(userId: string, startedAt: Date, endedAt: Date, category: string): Promise<DistractionLog> {
    const durationMinutes = Math.floor((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));
    
    const log = await this.distractionRepository.create({
      userId,
      startedAt,
      endedAt,
      durationMinutes,
      category,
      createdAt: new Date()
    });

    const date = startedAt.toISOString().split('T')[0];
    // Mutation triggers recompute for dashboard performance score
    await this.dailyLogService.recompute(userId, date);

    return log;
  }

  async getDailyLoss(userId: string, date: string): Promise<number> {
    return this.distractionRepository.getDailyTotalMinutes(userId, date);
  }
}
