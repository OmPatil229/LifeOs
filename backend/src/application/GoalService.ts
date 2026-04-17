import { IGoalRepository } from '../domain/repositories/IGoalRepository.js';
import { ITaskRepository } from '../domain/repositories/ITaskRepository.js';
import { IHabitRepository } from '../domain/repositories/IHabitRepository.js';
import { Goal, GoalType, GoalStatus } from '../domain/entities/Goal.js';
import { Task } from '../domain/entities/Task.js';

export class GoalService {
  constructor(
    private readonly goalRepository: IGoalRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly habitRepository: IHabitRepository
  ) {}

  /**
   * Retrieves the full goal hierarchy for a user's dashboard drilldown.
   * Year → Quarter → Week → Today's alignment.
   */
  async getGoalHierarchy(userId: string, date: string): Promise<Goal[]> {
    const goals = await this.goalRepository.findHierarchy(userId, date);
    return goals.map((g: Goal) => ({
      ...g,
      drift: this.calculateDrift(g, date)
    }));
  }

  private calculateDrift(goal: Goal, date: string): number {
    const now = new Date(date);
    let expectedProgress = 0;

    switch (goal.type) {
      case GoalType.DAY:
        // For a day goal, we divide by hours passed in the day? 
        // Or just compare to 50% if it's noon.
        const hours = now.getHours();
        expectedProgress = (hours / 24) * 100;
        break;
      case GoalType.WEEK:
        const dayOfWeek = now.getDay() || 7; // 1-7 (Mon-Sun)
        expectedProgress = (dayOfWeek / 7) * 100;
        break;
      case GoalType.MONTH:
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        expectedProgress = (dayOfMonth / daysInMonth) * 100;
        break;
      case GoalType.YEAR:
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        expectedProgress = (dayOfYear / 365) * 100;
        break;
    }

    return Math.round(goal.progressPercentage - expectedProgress);
  }

  async findByUserIdAndType(userId: string, type: string): Promise<Goal[]> {
    return (this.goalRepository as any).findByUserIdAndType(userId, type);
  }

  async updateGoal(id: string, goalData: Partial<Goal>): Promise<Goal | null> {
    return this.goalRepository.update(id, goalData);
  }

  async deleteGoal(id: string): Promise<boolean> {
    // 1. Orphan children goals (set parentId to null)
    const children = await (this.goalRepository as any).findByParentId(id);
    if (children && children.length > 0) {
      for (const child of children) {
        await this.goalRepository.update(child.id, { parentId: undefined });
      }
    }

    // 2. Orphan linked tasks (set goalId to null)
    const linkedTasks = await (this.taskRepository as any).findByGoalId(id);
    if (linkedTasks && linkedTasks.length > 0) {
      for (const task of linkedTasks) {
        await this.taskRepository.update(task.id, { goalId: undefined });
      }
    }

    // 3. Final deletion
    return this.goalRepository.delete(id);
  }

  async createGoal(userId: string, goalData: Partial<Goal>): Promise<Goal> {
    const goal = await this.goalRepository.create({
      ...goalData,
      userId,
      status: GoalStatus.ACTIVE,
      progressPercentage: 0,
      createdAt: new Date()
    });
    return goal;
  }

  /**
   * Updates goal progress and triggers parent recalculation.
   * This is the core logic for the "drilldown" hierarchy.
   */
  async updateProgress(goalId: string, progress: number): Promise<Goal | null> {
    const status = progress >= 100 ? GoalStatus.COMPLETED : 
                   progress <= 10 ? GoalStatus.AT_RISK : GoalStatus.ACTIVE;

    const goal = await this.goalRepository.updateProgress(goalId, progress, status);
    if (!goal) return null;

    // Trigger parent recalculation if it exists (Year ← Quarter ← Week)
    if (goal.parentId) {
      await this.recalculateParentGoal(goal.parentId);
    }

    return goal;
  }

  private async recalculateParentGoal(parentId: string): Promise<void> {
    // 1. Fetch the parent to verify context
    const parent = await this.goalRepository.update(parentId, {}); 
    if (!parent) return;

    // 2. Fetch all children of this parent
    // Cast repository to any if needed to access extended methods or just use generic find.
    // For this context, we'll assume the repository can filter by parentId.
    const children = await (this.goalRepository as any).findByParentId(parentId);
    if (!children || children.length === 0) return;

    // 3. Calculate Average Progress
    const totalProgress = children.reduce((acc: number, child: any) => acc + (child.progressPercentage || 0), 0);
    const averageProgress = Math.round(totalProgress / children.length);

    // 4. Update parent progress
    const status = averageProgress >= 100 ? GoalStatus.COMPLETED : 
                   averageProgress <= 10 ? GoalStatus.AT_RISK : GoalStatus.ACTIVE;
    
    const updatedParent = await this.goalRepository.updateProgress(parentId, averageProgress, status);

    // 5. Recursive Propagate Up (e.g. Week -> Month -> Year)
    if (updatedParent && updatedParent.parentId) {
      await this.recalculateParentGoal(updatedParent.parentId);
    }
  }

  /**
   * Recalculates goal progress based on linked tasks and habits.
   * Progress = (Completed Items / Total Items) * 100
   */
  async recalculateGoalFromItems(goalId: string): Promise<void> {
    const goal = await this.goalRepository.findById(goalId);
    if (!goal) return;

    // 1. Count linked tasks
    const allTasks = await this.taskRepository.findByGoalId(goalId);
    const completedTasks = allTasks.filter((t: Task) => t.status === 'completed').length;

    // 2. Count linked habit completions for the goal's period
    const { startDate, endDate } = this.getGoalPeriod(goal);
    const habitCounts = await this.habitRepository.countCompletionsForGoalInRange(
      goalId, startDate, endDate
    );

    // 3. Calculate progress
    const totalItems = allTasks.length + habitCounts.total;
    const completedItems = completedTasks + habitCounts.completed;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // 4. Update goal status and progress
    const status = progress >= 100 ? GoalStatus.COMPLETED : 
                   progress <= 10 ? GoalStatus.AT_RISK : GoalStatus.ACTIVE;
    
    await this.goalRepository.updateProgress(goalId, progress, status);

    // 5. Cascade to parent
    if (goal.parentId) {
      await this.recalculateParentGoal(goal.parentId);
    }
  }

  private getGoalPeriod(goal: Goal): { startDate: string; endDate: string } {
    const now = new Date();
    switch (goal.type) {
      case GoalType.DAY: {
        const d = now.toISOString().split('T')[0];
        return { startDate: d, endDate: d };
      }
      case GoalType.WEEK: {
        const day = now.getDay() || 7; // 1-7 (Mon-Sun)
        const monday = new Date(now);
        monday.setDate(now.getDate() - day + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { 
          startDate: monday.toISOString().split('T')[0], 
          endDate: sunday.toISOString().split('T')[0] 
        };
      }
      case GoalType.MONTH: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: end.toISOString().split('T')[0] 
        };
      }
      case GoalType.YEAR: {
        return { 
          startDate: `${now.getFullYear()}-01-01`, 
          endDate: `${now.getFullYear()}-12-31` 
        };
      }
      default:
        const d = now.toISOString().split('T')[0];
        return { startDate: d, endDate: d };
    }
  }

  /**
   * Calculates the average progress for each unique goal category.
   */
  async getCategoryProgress(userId: string): Promise<{ label: string; value: number }[]> {
    const goals = await this.goalRepository.findByUserId(userId);
    if (goals.length === 0) return [];

    const categories = Array.from(new Set(goals.filter(g => g.category).map(g => g.category!)));
    
    return categories.map(cat => {
      const catGoals = goals.filter(g => g.category === cat);
      const avg = catGoals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / catGoals.length;
      return {
        label: cat,
        value: Math.round(avg)
      };
    });
  }

  /**
   * Calculates the current streak of successfully completed goals.
   */
  async calculateGoalStreak(userId: string): Promise<number> {
    const goals = await this.goalRepository.findByUserId(userId);
    const completed = goals.filter(g => g.status === GoalStatus.COMPLETED);
    return completed.length;
  }
}
