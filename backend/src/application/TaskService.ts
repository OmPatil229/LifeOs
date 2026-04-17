import { ITaskRepository } from '../domain/repositories/ITaskRepository.js';
import { Task, TaskStatus, Timeframe } from '../domain/entities/Task.js';
import { DailyLogService } from './DailyLogService.js';
import { GoalService } from './GoalService.js';

export class TaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly dailyLogService: DailyLogService,
    private readonly goalService: GoalService
  ) {}

  async listTasksByDate(userId: string, date: string): Promise<Task[]> {
    return this.taskRepository.findByUserIdAndDate(userId, date);
  }

  /**
   * Automatically carries forward all incomplete (pending/missed) tasks from
   * past dates to today. Preserves the original timeframe so the task appears
   * in the same time slot the user originally planned it for.
   *
   * Called lazily when the timeline is fetched — idempotent and handles
   * multi‑day gaps (e.g. user doesn't log in over a weekend).
   *
   * @returns The list of tasks that were auto‑carried forward.
   */
  async autoCarryForwardMissedTasks(userId: string, today: string): Promise<Task[]> {
    const overdue = await this.taskRepository.findIncompleteBeforeDate(userId, today);
    if (overdue.length === 0) return [];

    // Collect unique old dates so we can recompute their logs once
    const affectedDates = new Set<string>();
    const carried: Task[] = [];

    for (const task of overdue) {
      affectedDates.add(task.date);
      const updated = await this.taskRepository.update(task.id, {
        date: today,
        // Keep original timeframe — task appears at the same time slot
        status: TaskStatus.PENDING,
        isCarriedForward: true
      });
      if (updated) carried.push(updated);
    }

    // Recompute daily logs for all affected dates + today
    const recomputePromises = [...affectedDates].map(d =>
      this.dailyLogService.recompute(userId, d)
    );
    recomputePromises.push(this.dailyLogService.recompute(userId, today));
    await Promise.all(recomputePromises);

    return carried;
  }

  async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    const task = await this.taskRepository.create({
      ...taskData,
      userId,
      status: TaskStatus.PENDING,
      isRecommended: false,
      createdAt: new Date()
    });

    // Strategy: Every create/update triggers a recompute of precomputed logs for fast reads
    await this.dailyLogService.recompute(userId, task.date);
    return task;
  }

  async completeTask(userId: string, taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) return null;

    const updatedTask = await this.taskRepository.updateStatus(taskId, TaskStatus.COMPLETED);
    if (!updatedTask) return null;

    // Recalculate goal progress if linked
    if (updatedTask.goalId) {
       await this.goalService.recalculateGoalFromItems(updatedTask.goalId);
    }

    // Mutation triggers recompute
    await this.dailyLogService.recompute(userId, updatedTask.date);
    return updatedTask;
  }

  async rescheduleTask(userId: string, taskId: string, newDate: string, timeframe: Timeframe): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) return null;

    const oldDate = task.date;
    const updatedTask = await this.taskRepository.update(taskId, { date: newDate, timeframe });
    
    // Mutation triggers recompute for BOTH dates (if moved)
    await this.dailyLogService.recompute(userId, newDate);
    if (oldDate !== newDate) {
      await this.dailyLogService.recompute(userId, oldDate);
    }

    return updatedTask;
  }

  async getWeeklyTasks(userId: string, startDate: string): Promise<Task[]> {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];
    
    return this.taskRepository.findByUserIdAndDateRange(userId, startDate, endDate);
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) return null;

    const oldDate = task.date;
    const updatedTask = await this.taskRepository.update(taskId, updates);
    if (!updatedTask) return null;

    // Recompute for new and old dates if moved
    await this.dailyLogService.recompute(userId, updatedTask.date);
    if (oldDate !== updatedTask.date) {
      await this.dailyLogService.recompute(userId, oldDate);
    }

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) return false;

    const success = await this.taskRepository.delete(taskId);
    if (success) {
      await this.dailyLogService.recompute(userId, task.date);
    }
    return success;
  }

  /**
   * Reschedules a single incomplete task to the next calendar day.
   * Marks the task as carried forward for analytics tracking.
   */
  async rescheduleToNextDay(userId: string, taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) return null;

    const nextDate = this.getNextDate(task.date);
    const updatedTask = await this.taskRepository.update(taskId, {
      date: nextDate,
      status: TaskStatus.PENDING,
      isCarriedForward: true
    });

    if (updatedTask) {
      // Recompute logs for both affected dates
      await Promise.all([
        this.dailyLogService.recompute(userId, task.date),
        this.dailyLogService.recompute(userId, nextDate)
      ]);
    }

    return updatedTask;
  }

  /**
   * Batch carry-forward: moves ALL incomplete (pending/missed) tasks 
   * for a given date to the next calendar day.
   * Returns the list of rescheduled tasks.
   */
  async carryForwardTasks(userId: string, date: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findByUserIdAndDate(userId, date);
    const incomplete = tasks.filter(
      t => t.status === TaskStatus.PENDING || t.status === TaskStatus.MISSED
    );

    if (incomplete.length === 0) return [];

    const nextDate = this.getNextDate(date);
    const rescheduled: Task[] = [];

    for (const task of incomplete) {
      const updated = await this.taskRepository.update(task.id, {
        date: nextDate,
        status: TaskStatus.PENDING,
        isCarriedForward: true
      });
      if (updated) rescheduled.push(updated);
    }

    // Recompute logs for both dates once after all updates
    await Promise.all([
      this.dailyLogService.recompute(userId, date),
      this.dailyLogService.recompute(userId, nextDate)
    ]);

    return rescheduled;
  }

  /**
   * Returns carry-forward counts for the current week, month, and year.
   * Only counts tasks (not habits).
   */
  async getCarryForwardStats(userId: string): Promise<{ week: number; month: number; year: number }> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Week: Monday to Sunday of current week
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Month: 1st to last day of current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Year: Jan 1 to Dec 31
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    const [week, month, year] = await Promise.all([
      this.taskRepository.countCarriedForwardByDateRange(
        userId,
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      ),
      this.taskRepository.countCarriedForwardByDateRange(
        userId,
        monthStart.toISOString().split('T')[0],
        monthEnd.toISOString().split('T')[0]
      ),
      this.taskRepository.countCarriedForwardByDateRange(
        userId,
        yearStart.toISOString().split('T')[0],
        yearEnd.toISOString().split('T')[0]
      )
    ]);

    return { week, month, year };
  }

  /**
   * Returns the next calendar date (YYYY-MM-DD) from a given date string.
   */
  private getNextDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
}
