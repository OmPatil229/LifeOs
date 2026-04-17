export enum GoalType {
  YEAR = 'year',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  AT_RISK = 'at-risk',
  FAIL = 'fail'
}

export enum GoalCategory {
  HEALTH = 'health',
  SKILL = 'skill',
  BUSINESS = 'business',
  OTHER = 'other'
}

export interface Goal {
  id: string;
  userId: string;
  parentId?: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  category: GoalCategory;
  priority: 'low' | 'medium' | 'high';
  targetHours: number;
  progressPercentage: number;
  drift?: number; // +/- % from expected trajectory
  targetValue?: number;
  currentValue?: number;
  deadline?: Date;
  createdAt: Date;
}
