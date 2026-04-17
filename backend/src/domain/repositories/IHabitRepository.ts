import { Habit, HabitCompletion } from '../entities/Habit.js';

export interface IHabitRepository {
  findById(id: string): Promise<Habit | null>;
  findByUserId(userId: string): Promise<Habit[]>;
  findByUserIdAndDay(userId: string, day: number): Promise<Habit[]>;
  create(habit: Partial<Habit>): Promise<Habit>;
  update(id: string, habit: Partial<Habit>): Promise<Habit | null>;
  delete(id: string): Promise<boolean>;
  logCompletion(completion: Partial<HabitCompletion>): Promise<HabitCompletion>;
  getCompletionForDate(habitId: string, date: string): Promise<HabitCompletion | null>;
  getDailyPerformance(userId: string, date: string): Promise<{ total: number; completed: number }>;
  updateStreak(id: string, streak: number, bestStreak: number): Promise<Habit | null>;
  listCompletionsByDate(userId: string, date: string): Promise<HabitCompletion[]>;
  findByGoalId(goalId: string): Promise<Habit[]>;
  countCompletionsForGoalInRange(goalId: string, startDate: string, endDate: string): Promise<{ total: number; completed: number }>;
}
