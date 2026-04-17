import express, { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { TimelineController } from '../controllers/TimelineController.js';
import { TaskController, HabitController } from '../controllers/TaskHabitControllers.js';
import { TimeCardController } from '../controllers/TimeCardController.js';
import { JournalController } from '../controllers/JournalController.js';
import { authMiddleware } from '../middlewares/AuthMiddleware.js';

/**
 * REST API v1 Routing — The Behavioral Logic Hub.
 * Wires Clean Architecture Controllers into Express endpoints.
 */
import { SessionController } from '../controllers/SessionController.js';
import { GoalController } from '../controllers/GoalController.js';
import { EarlyAccessController } from '../controllers/EarlyAccessController.js';

export const createV1Router = (
  authController: AuthController,
  dashboardController: DashboardController,
  timelineController: TimelineController,
  taskController: TaskController,
  habitController: HabitController,
  timeCardController: TimeCardController,
  sessionController: SessionController,
  goalController: GoalController,
  journalController: JournalController,
  earlyAccessController: EarlyAccessController
): Router => {
  const router = Router();

  // Public Marketing / Early Access
  router.post('/early-access', (req, res) => earlyAccessController.joinWaitlist(req, res));
  router.get('/early-access/count', (req, res) => earlyAccessController.getCount(req, res));

  // Public Identity / Security
  router.post('/auth/register', (req, res) => authController.register(req, res));
  router.post('/auth/login', (req, res) => authController.login(req, res));
  router.get('/auth/me', authMiddleware, (req, res) => authController.me(req, res));
  router.put('/auth/onboarding/complete', authMiddleware, (req, res) => authController.completeOnboarding(req, res));


  // High-Performance Performance Scores / Dashboard (Precomputed)
  router.get('/dashboard', authMiddleware, (req, res) => dashboardController.getDashboard(req, res));
  router.get('/dashboard/decision', authMiddleware, (req, res) => dashboardController.getDecision(req, res));
  router.get('/dashboard/insights', authMiddleware, (req, res) => dashboardController.getInsights(req, res));
  router.get('/dashboard/trend', authMiddleware, (req, res) => dashboardController.getTrendData(req, res));
  router.post('/dashboard/commit-plan', authMiddleware, (req, res) => dashboardController.commitDailyPlan(req, res));

  // Behavioral Manipulation Engine / Adaptive Schedule
  router.get('/timeline', authMiddleware, (req, res) => timelineController.getTimeline(req, res));
  router.get('/timeline/week', authMiddleware, (req, res) => timelineController.getWeeklyTimeline(req, res));

  // Lean Interaction / Mutation Layer
  router.get('/tasks', authMiddleware, (req, res) => taskController.getTasks(req, res));
  router.post('/tasks', authMiddleware, (req, res) => taskController.createTask(req, res));
  // Carry-forward routes — placed before /:id to prevent param conflicts
  router.post('/tasks/carry-forward', authMiddleware, (req, res) => taskController.carryForward(req, res));
  router.get('/tasks/carry-forward-stats', authMiddleware, (req, res) => taskController.getCarryForwardStats(req, res));
  router.put('/tasks/:id', authMiddleware, (req, res) => taskController.updateTask(req, res));
  router.put('/tasks/:id/complete', authMiddleware, (req, res) => taskController.completeTask(req, res));
  router.post('/tasks/:id/carry-forward', authMiddleware, (req, res) => taskController.carryForwardSingle(req, res));
  router.delete('/tasks/:id', authMiddleware, (req, res) => taskController.deleteTask(req, res));

  router.get('/habits', authMiddleware, (req, res) => habitController.getHabits(req, res));
  router.post('/habits', authMiddleware, (req, res) => habitController.createHabit(req, res));
  router.put('/habits/:id', authMiddleware, (req, res) => habitController.updateHabit(req, res));
  router.delete('/habits/:id', authMiddleware, (req, res) => habitController.deleteHabit(req, res));
  router.post('/habits/:id/complete', authMiddleware, (req, res) => habitController.markHabitComplete(req, res));

  // TimeCard Layer
  router.get('/timecards/:layer/:dateStr', authMiddleware, (req, res) => timeCardController.getCard(req, res));
  router.post('/timecards/:layer/:dateStr', authMiddleware, (req, res) => timeCardController.saveCard(req, res));

  // Session Layer
  router.get('/sessions/active', authMiddleware, (req, res) => sessionController.getActiveSession(req, res));
  router.post('/sessions/start', authMiddleware, (req, res) => sessionController.startSession(req, res));
  router.post('/sessions/end', authMiddleware, (req, res) => sessionController.endSession(req, res));

  // Goal Layer
  router.get('/goals', authMiddleware, (req, res) => goalController.getGoals(req, res));
  router.post('/goals', authMiddleware, (req, res) => goalController.createGoal(req, res));
  router.put('/goals/:id', authMiddleware, (req, res) => goalController.updateGoal(req, res));
  router.delete('/goals/:id', authMiddleware, (req, res) => goalController.deleteGoal(req, res));

  // Journal Layer
  router.get('/journal/history', authMiddleware, (req, res) => journalController.getHistory(req, res));
  router.get('/journal/search', authMiddleware, (req, res) => journalController.searchHistory(req, res));
  router.get('/journal/:date', authMiddleware, (req, res) => journalController.getEntry(req, res));
  router.post('/journal/:date', authMiddleware, (req, res) => journalController.updateEntry(req, res));

  return router;
};
