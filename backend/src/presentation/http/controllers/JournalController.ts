import { Request, Response } from 'express';
import { JournalService } from '../../../application/JournalService.js';
import { winstonLogger as logger } from '../../../infrastructure/config/logger.js';

/**
 * JournalController — Data Entry & Sentiment Analysis Gateway.
 * Collects "Poetry to Pattern" inputs for behavior mining.
 */
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  async getEntry(req: Request, res: Response): Promise<void> {
    try {
      const date = req.params.date as string;
      const userId = (req as any).user.id;
      
      const entry = await this.journalService.getEntryByDate(userId, date);
      res.status(200).json({ success: true, data: entry });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateEntry(req: Request, res: Response): Promise<void> {
    try {
      const date = req.params.date as string;
      const userId = (req as any).user.id;
      const data = req.body;
      
      const entry = await this.journalService.createOrUpdateEntry(userId, date, data);
      res.status(200).json({ success: true, data: entry });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query as { from: string, to: string };
      const userId = (req as any).user.id;
      
      const history = await this.journalService.listHistory(userId, from, to);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async searchHistory(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query as { q: string };
      const userId = (req as any).user.id;
      
      const searchResults = await this.journalService.searchEntries(userId, q);
      res.status(200).json({ success: true, data: searchResults });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
