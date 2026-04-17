import { Request, Response } from 'express';
import { TaskService } from '../../../application/TaskService.js';
import { HabitService } from '../../../application/HabitService.js';

export class TimelineController {
  constructor(
    private readonly taskService: TaskService,
    private readonly habitService: HabitService
  ) {}

  /**
   * GET /api/v1/timeline?date=2026-03-22
   * Merges Tasks and auto-injected Habits into a single adaptive schedule.
   */
  async getTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query as { date: string };
      const userId = (req as any).user.id;

      if (!date) {
        res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
        return;
      }

      // Auto-carry-forward: move any overdue incomplete tasks to today,
      // preserving their original timeframe (morning/afternoon/evening/night).
      // This runs lazily on timeline fetch and is idempotent.
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        await this.taskService.autoCarryForwardMissedTasks(userId, today);
      }

      const [tasks, habits] = await Promise.all([
        this.taskService.listTasksByDate(userId, date),
        this.habitService.listHabitsByUserId(userId)
      ]);

      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const activeHabits = habits.filter(h => h.scheduleDays.includes(dayOfWeek) && h.isActive);

      // Fetch all completions for this user on this date in one go
      // Note: Assume repository has listCompletionsByUserIdAndDate or similar. 
      // If not, I'll add it.
      const completions = await this.habitService.listCompletionsByDate(userId, date);
      const completedHabitIds = new Set(completions.map((c: any) => c.habitId.toString()));

      // Map habits to a timeline-compatible shape
      const timelineHabits = activeHabits.map(h => ({
        id: h.id,
        type: 'habit',
        title: h.name,
        timeframe: h.timeframe,
        scheduledTime: h.startTime,
        status: completedHabitIds.has(h.id) ? 'completed' : 'pending',
        streak: h.streakCurrent,
        color: h.color,
        icon: h.icon
      }));

      const timelineTasks = tasks.map(t => ({
        id: t.id,
        type: 'task',
        title: t.title,
        timeframe: t.timeframe,
        scheduledTime: t.scheduledTime,
        status: t.status,
        priority: t.priority,
        energy: t.energyRequired,
        isRecommended: t.isRecommended
      }));

      // Merge and group by timeframe
      const timeline = {
        morning: [...timelineHabits, ...timelineTasks].filter(i => i.timeframe === 'morning'),
        afternoon: [...timelineHabits, ...timelineTasks].filter(i => i.timeframe === 'afternoon'),
        evening: [...timelineHabits, ...timelineTasks].filter(i => i.timeframe === 'evening'),
        night: [...timelineHabits, ...timelineTasks].filter(i => i.timeframe === 'night')
      };

      res.status(200).json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/timeline/week?startDate=2026-03-22
   * Returns a 7-day distribution of tasks for the Weekly Pipeline.
   */
  async getWeeklyTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { startDate } = req.query as { startDate: string };
      const userId = (req as any).user.id;

      if (!startDate) {
        res.status(400).json({ success: false, message: 'startDate is required (YYYY-MM-DD)' });
        return;
      }

      const tasks = await this.taskService.getWeeklyTasks(userId, startDate);

      // Group tasks by date
      const days: Record<string, any[]> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        days[dateStr] = tasks.filter(t => t.date === dateStr);
      }

      res.status(200).json({ success: true, data: days });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
