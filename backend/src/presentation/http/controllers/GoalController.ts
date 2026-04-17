import { Request, Response } from 'express';
import { GoalService } from '../../../application/GoalService.js';
import { GoalStatus } from '../../../domain/entities/Goal.js';

export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  async getGoals(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { type, date } = req.query as { type: any, date: string };
      
      let goals;
      if (type) {
        goals = await this.goalService.findByUserIdAndType(userId, type);
      } else {
        goals = await this.goalService.getGoalHierarchy(userId, date || new Date().toISOString().split('T')[0]);
      }
      
      res.status(200).json({ success: true, data: goals });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createGoal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const goal = await this.goalService.createGoal(userId, req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateGoal(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const goal = await this.goalService.updateGoal(id, req.body);
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteGoal(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.goalService.deleteGoal(id);
      res.status(200).json({ success: true, message: 'Goal deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
