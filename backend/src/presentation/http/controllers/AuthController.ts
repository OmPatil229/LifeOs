import { Request, Response } from 'express';
import { AuthService } from '../../../application/AuthService.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const token = await this.authService.register(name, email, password);
      res.status(201).json({ success: true, token });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await this.authService.login(email, password);
      res.status(200).json({ success: true, token });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async completeOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      await this.authService.completeOnboarding(userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const user = await this.authService.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

