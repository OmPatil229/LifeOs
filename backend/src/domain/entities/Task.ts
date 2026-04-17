export enum Timeframe {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night'
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  MISSED = 'missed',
  DELAYED = 'delayed'
}

export enum EnergyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  date: string;
  timeframe: Timeframe;
  scheduledTime?: string;
  status: TaskStatus;
  priority: Priority;
  energyRequired: EnergyLevel;
  allocatedHours: number;
  trackedTimeMinutes: number;
  focusLevel?: number;
  tags: string[];
  isRecommended: boolean;
  isCarriedForward: boolean;
  completedAt?: Date;
  createdAt: Date;
}
