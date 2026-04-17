export enum InsightType {
  PATTERN = 'pattern',
  SUGGESTION = 'suggestion',
  RECOVERY_STATUS = 'recovery_status',
  SOCIAL_BENCHMARK = 'social_benchmark'
}

export enum InsightPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface Insight {
  id: string;
  userId: string;
  period: InsightPeriod;
  date: string; // YYYY-MM-DD
  type: InsightType;
  title: string;
  description: string;
  actionableSuggestion?: string;
  priority: 'low' | 'medium' | 'high';
  seenAt?: Date;
  metadata: Record<string, any>; // e.g. { pattern: '9PM-tasks-fail', lossHours: 8.4 }
  createdAt: Date;
}
