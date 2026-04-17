import { Request, Response } from 'express';
import { TimeCardService } from '../../../application/TimeCardService.js';
import { TimeLayer } from '../../../domain/entities/TimeCard.js';

export class TimeCardController {
  constructor(private readonly timeCardService: TimeCardService) {}

  async getCard(req: Request, res: Response): Promise<void> {
    try {
      const layer = req.params.layer as string;
      const dateStr = req.params.dateStr as string;
      const userId = (req as any).user.id;

      // Validate layer
      if (!['day', 'week', 'month', 'year'].includes(layer)) {
        res.status(400).json({ success: false, message: 'Invalid layer parameter.' });
        return;
      }

      const card = await this.timeCardService.getCard(userId, layer as TimeLayer, dateStr);
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async saveCard(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      const layer = req.params.layer as string;
      const dateStr = req.params.dateStr as string;
      const userId = (req as any).user.id;

      if (!['day', 'week', 'month', 'year'].includes(layer)) {
        res.status(400).json({ success: false, message: 'Invalid layer parameter.' });
        return;
      }

      const card = await this.timeCardService.saveCard(userId, layer as TimeLayer, dateStr, content || '');
      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
