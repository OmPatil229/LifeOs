import { Request, Response } from 'express';
import { EarlyAccessService } from '../../../application/EarlyAccessService.js';
import { MongooseEarlyAccessRepository } from '../../../infrastructure/database/mongoose/repositories/MongooseEarlyAccessRepository.js';

export class EarlyAccessController {
  constructor(private readonly service: EarlyAccessService) {}

  joinWaitlist = async (req: Request, res: Response) => {
    try {
      const { email, source } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }

      const result = await this.service.joinWaitlist(email, source);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('EarlyAccessController Error:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
  };

  getCount = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getCount();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}
