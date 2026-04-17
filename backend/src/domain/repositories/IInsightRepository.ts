import { Insight, InsightType, InsightPeriod } from '../entities/Insight.js';

export interface IInsightRepository {
  findById(id: string): Promise<Insight | null>;
  findByUserId(userId: string, period?: InsightPeriod): Promise<Insight[]>;
  findByUserIdAndType(userId: string, type: InsightType): Promise<Insight[]>;
  create(insight: Partial<Insight>): Promise<Insight>;
  markAsSeen(id: string): Promise<boolean>;
  deleteOld(userId: string, olderThan: Date): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
}
