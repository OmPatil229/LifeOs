import { Request, Response } from 'express';
import { TaskService } from '../../../application/TaskService.js';
import { HabitService } from '../../../application/HabitService.js';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query as { date: string };
      const userId = (req as any).user.id;
      const tasks = await this.taskService.listTasksByDate(userId, date);
      res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const task = await this.taskService.createTask(userId, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const task = await this.taskService.completeTask(userId, id);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const updates = req.body;
      const task = await this.taskService.updateTask(userId, id, updates);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const success = await this.taskService.deleteTask(userId, id);
      res.status(200).json({ success: true, data: { success } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/tasks/carry-forward
   * Batch carry-forward: moves all incomplete tasks for a date to the next day.
   */
  async carryForward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { date } = req.body as { date: string };
      if (!date) {
        res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
        return;
      }
      const rescheduled = await this.taskService.carryForwardTasks(userId, date);
      res.status(200).json({ success: true, data: rescheduled });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/tasks/:id/carry-forward
   * Carries a single task forward to the next day.
   */
  async carryForwardSingle(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const task = await this.taskService.rescheduleToNextDay(userId, id);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/tasks/carry-forward-stats
   * Returns carry-forward counts for week, month, and year.
   */
  async getCarryForwardStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await this.taskService.getCarryForwardStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  async getHabits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habits = await this.habitService.listHabitsByUserId(userId);
      res.status(200).json({ success: true, data: habits });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async markHabitComplete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { date } = req.body;
      const userId = (req as any).user.id;
      const completion = await this.habitService.markComplete(userId, id, date);
      res.status(200).json({ success: true, data: completion });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createHabit(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const habit = await this.habitService.createHabit(userId, req.body);
      res.status(201).json({ success: true, data: habit });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateHabit(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const habit = await this.habitService.updateHabit(userId, id, req.body);
      res.status(200).json({ success: true, data: habit });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteHabit(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;
      const success = await this.habitService.deleteHabit(userId, id);
      res.status(200).json({ success: true, data: { success } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
