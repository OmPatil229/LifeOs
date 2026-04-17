export enum SystemStatus {
  STABLE = 'stable',
  RECOVERY = 'recovery',
  DECLINING = 'declining'
}

export interface DayPerformance {
  tasksTotal: number;
  tasksCompleted: number;
  habitsTotal: number;
  habitsCompleted: number;
  distractionMinutes: number;
  moodAvg: number;
  energyAvg: number;
  score: number; // 0-100
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  performance: DayPerformance;
  timeframeStats: {
    morning: number; // 0-100
    afternoon: number;
    evening: number;
    night: number;
  };
  intentSnapshot?: {
    isLocked: boolean;
    lockedAt?: Date;
    plannedTaskIds: string[];
    plannedHabitIds: string[];
  };
  status: SystemStatus;
  recoveryModeActive: boolean;
  burnoutRisk: number; // 0-100
  focusHours: number;
  mood?: number;
  energy?: 'low' | 'medium' | 'high';
  tags?: string[];
  updatedAt: Date;
}
