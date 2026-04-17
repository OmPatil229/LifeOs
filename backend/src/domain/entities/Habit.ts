import { Timeframe } from './Task.js';

export interface Habit {
  id: string;
  userId: string;
  goalId?: string; // Links habit to a specific goal
  name: string;
  description?: string;
  timeframe: Timeframe;
  scheduleDays: number[]; // 0-6 (Sun-Sat)
  startTime?: string; // HH:mm
  color: string;
  icon: string;
  isActive: boolean;
  streakCurrent: number;
  streakBest: number;
  completionRate: number; // 0-1 (30d)
  createdAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'missed';
  createdAt: Date;
}
