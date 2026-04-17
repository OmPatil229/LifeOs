import { Request, Response } from 'express';
import { SessionService } from '../../../application/SessionService.js';

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, moodBefore } = req.body;
      const userId = (req as any).user?.id || '65f1a2b3c4d5e6f7a8b9c0d1'; // Fallback for testing
      const session = await this.sessionService.startSession(userId, taskId, moodBefore);
      res.status(201).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { moodAfter, focusQuality } = req.body;
      const userId = (req as any).user?.id || '65f1a2b3c4d5e6f7a8b9c0d1';
      const session = await this.sessionService.endSession(userId, moodAfter, focusQuality);
      res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getActiveSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || '65f1a2b3c4d5e6f7a8b9c0d1';
      const session = await this.sessionService.getActiveSession(userId);
      res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
