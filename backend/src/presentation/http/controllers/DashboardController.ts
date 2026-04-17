import { Request, Response } from 'express';
import { DailyLogService } from '../../../application/DailyLogService.js';
import { InsightService } from '../../../application/InsightService.js';
import { GoalService } from '../../../application/GoalService.js';
import { EnergyLevel } from '../../../domain/entities/Task.js';

export class DashboardController {
  constructor(
    private readonly dailyLogService: DailyLogService,
    private readonly insightService: InsightService,
    private readonly goalService: GoalService
  ) {}

  /**
   * GET /api/v1/dashboard
   * Returns the precomputed daily log for the dashboard.
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query as { date: string };
      const userId = (req as any).user.id; // From Auth Middleware

      if (!date) {
        res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
        return;
      }

      const log = await this.dailyLogService.getDashboardData(userId, date);
      res.status(200).json({ success: true, data: log });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/dashboard/decision
   * Returns the Best Next Action recommendation from the Decision Engine.
   */
  async getDecision(req: Request, res: Response): Promise<void> {
    try {
      const { energy } = req.query as { energy: EnergyLevel };
      const userId = (req as any).user.id;

      const decision = await this.insightService.getBestNextAction(userId, energy || EnergyLevel.MEDIUM);
      res.status(200).json({ success: true, data: decision });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/dashboard/insights
   */
  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const accuracy = await this.insightService.calculatePlanningAccuracy(userId);
      const moodProductivity = await this.insightService.analyzeMoodVsProductivity(userId);
      const peakTime = await this.insightService.analyzePeakProductivity(userId);
      const focusQuality = await this.insightService.calculateFocusQuality(userId);
      const burnoutRisk = await this.insightService.evaluateBurnoutRisk(userId);
      const habitPerformance = await this.insightService.calculateHabitPerformance(userId, date);
      const failureReason = await this.insightService.generateDailyFailureReason(userId, date);
      const monthTrajectory = await this.insightService.getTrajectory(userId, 'month');
      const yearTrajectory = await this.insightService.getTrajectory(userId, 'year');
      
      const capacityGain = await this.insightService.calculateCapacityGain(userId);
      const consistencyRate = await this.insightService.calculateConsistencyRate(userId);
      const efficiencyFactor = await this.insightService.calculateEfficiencyFactor(userId);
      
      const goalStreak = await this.goalService.calculateGoalStreak(userId);
      const categoryProgress = await this.goalService.getCategoryProgress(userId);

      res.status(200).json({
        success: true,
        data: {
          accuracy,
          moodProductivity,
          peakTime,
          focusQuality,
          burnoutRisk,
          habitPerformance,
          failureReason,
          monthTrajectory,
          yearTrajectory,
          capacityGain,
          consistencyRate,
          efficiencyFactor,
          focusMix: await this.insightService.calculateFocusMix(userId),
          goalStreak,
          categoryProgress
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/dashboard/trend
   */
  async getTrendData(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { days } = req.query as { days: string };

      const productivity = await this.insightService.getProductivityTrend(userId, days ? parseInt(days) : 7);
      const biometrics = await this.insightService.getBiometricTrend(userId, days ? parseInt(days) : 7);

      res.status(200).json({ 
        success: true, 
        data: {
          productivity,
          biometrics
        } 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/dashboard/commit-plan
   */
  async commitDailyPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const date = new Date().toISOString().split('T')[0];
      const result = await this.insightService.commitDailyPlan(userId, date);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
