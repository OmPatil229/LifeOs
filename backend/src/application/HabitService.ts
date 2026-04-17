import { IHabitRepository } from '../domain/repositories/IHabitRepository.js';
import { Habit, HabitCompletion } from '../domain/entities/Habit.js';
import { Timeframe } from '../domain/entities/Task.js';
import { DailyLogService } from './DailyLogService.js';
import { GoalService } from './GoalService.js';

export class HabitService {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly dailyLogService: DailyLogService,
    private readonly goalService: GoalService
  ) {}

  async listHabitsByUserId(userId: string): Promise<Habit[]> {
    return this.habitRepository.findByUserId(userId);
  }

  async createHabit(userId: string, habitData: Partial<Habit>): Promise<Habit> {
    const habit = await this.habitRepository.create({
      ...habitData,
      userId,
      isActive: true,
      streakCurrent: 0,
      streakBest: 0,
      completionRate: 0,
      createdAt: new Date()
    });
    return habit;
  }

  /**
   * Logs a completion for a habit on a specific date.
   * This is a critical behavioral action that triggers streak updates
   * and dashboard recomputes.
   */
  async markComplete(userId: string, habitId: string, date: string): Promise<HabitCompletion | null> {
    const completion = await this.habitRepository.logCompletion({
      userId,
      habitId,
      date,
      status: 'completed',
      createdAt: new Date()
    });

    if (!completion) return null;

    // Trigger streak update (simplistic logic)
    const habit = await this.habitRepository.findById(habitId);
    if (habit) {
      const newStreak = habit.streakCurrent + 1;
      const newBest = Math.max(newStreak, habit.streakBest);
      await this.habitRepository.updateStreak(habitId, newStreak, newBest);
    }

    // Every mutation triggers recompute for dashboard performance
    await this.dailyLogService.recompute(userId, date);

    // Propagate to linked goal if it exists
    if (habit?.goalId) {
       await this.goalService.recalculateGoalFromItems(habit.goalId);
    }

    return completion;
  }

  async updateHabit(userId: string, habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit || habit.userId !== userId) return null;

    const oldGoalId = habit.goalId;
    const updatedHabit = await this.habitRepository.update(habitId, updates);
    
    if (updatedHabit) {
      if (updatedHabit.goalId) {
        await this.goalService.recalculateGoalFromItems(updatedHabit.goalId);
      }
      if (oldGoalId && oldGoalId !== updatedHabit.goalId) {
        await this.goalService.recalculateGoalFromItems(oldGoalId);
      }
    }

    return updatedHabit;
  }

  async deleteHabit(userId: string, habitId: string): Promise<boolean> {
    const habit = await this.habitRepository.findById(habitId);
    if (!habit || habit.userId !== userId) return false;

    const goalId = habit.goalId;
    const success = await this.habitRepository.delete(habitId);
    
    if (success && goalId) {
      await this.goalService.recalculateGoalFromItems(goalId);
    }

    return success;
  }

  async listCompletionsByDate(userId: string, date: string): Promise<HabitCompletion[]> {
    return this.habitRepository.listCompletionsByDate(userId, date);
  }
}
export { Timeframe };
