import { ISessionRepository } from '../domain/repositories/ISessionRepository.js';
import { ITaskRepository } from '../domain/repositories/ITaskRepository.js';
import { IGoalRepository } from '../domain/repositories/IGoalRepository.js';
import { Session } from '../domain/entities/Session.js';
import { GoalStatus } from '../domain/entities/Goal.js';
import { TaskStatus } from '../domain/entities/Task.js';

export class SessionService {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly goalRepository: IGoalRepository
  ) {}

  private async recalculateGoalProgress(goalId: string): Promise<void> {
    const [goal, tasks] = await Promise.all([
      this.goalRepository.findById(goalId),
      this.taskRepository.findByGoalId(goalId)
    ]);

    if (!goal || !goal.targetHours) return;

    const totalMinutesTracked = tasks.reduce((sum, t) => sum + (t.trackedTimeMinutes || 0), 0);
    const targetMinutes = goal.targetHours * 60;
    const newProgress = Math.min(Math.round((totalMinutesTracked / targetMinutes) * 100), 100);
    
    await this.goalRepository.updateProgress(goalId, newProgress, newProgress >= 100 ? GoalStatus.COMPLETED : GoalStatus.ACTIVE);
  }

  async startSession(userId: string, taskId?: string, moodBefore?: number): Promise<Session> {
    const activeSession = await this.sessionRepository.findActiveByUserId(userId);
    if (activeSession) {
      throw new Error('A session is already active');
    }

    return this.sessionRepository.create({
      userId,
      taskId,
      startTime: new Date(),
      moodBefore
    });
  }

  async endSession(userId: string, moodAfter?: number, focusQuality?: number): Promise<Session> {
    const activeSession = await this.sessionRepository.findActiveByUserId(userId);
    if (!activeSession) {
      throw new Error('No active session found');
    }

    const endTime = new Date();
    const durationMinutes = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / 60000);

    const updatedSession = await this.sessionRepository.update(activeSession.id, {
      endTime,
      moodAfter,
      focusQuality
    });

    if (activeSession.taskId && updatedSession) {
      const task = await this.taskRepository.findById(activeSession.taskId);
      if (task) {
        const newTrackedTime = (task.trackedTimeMinutes || 0) + durationMinutes;
        await this.taskRepository.update(task.id, {
          trackedTimeMinutes: newTrackedTime,
          status: task.status === TaskStatus.PENDING ? TaskStatus.PENDING : task.status 
        });

        // Trigger goal recalculation if task is linked to a goal
        if (task.goalId) {
           await this.recalculateGoalProgress(task.goalId);
        }
      }
    }

    return updatedSession!;
  }

  async getActiveSession(userId: string): Promise<Session | null> {
    return this.sessionRepository.findActiveByUserId(userId);
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }
}
