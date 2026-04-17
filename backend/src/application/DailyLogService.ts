import { IDailyLogRepository } from '../domain/repositories/IDailyLogRepository.js';
import { ITaskRepository } from '../domain/repositories/ITaskRepository.js';
import { IHabitRepository } from '../domain/repositories/IHabitRepository.js';
import { IJournalEntryRepository } from '../domain/repositories/IJournalEntryRepository.js';
import { ISessionRepository } from '../domain/repositories/ISessionRepository.js';
import { DailyLog, SystemStatus } from '../domain/entities/DailyLog.js';
import { TaskStatus, Timeframe } from '../domain/entities/Task.js';

export class DailyLogService {
  constructor(
    private readonly logRepository: IDailyLogRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly habitRepository: IHabitRepository,
    private readonly journalRepository: IJournalEntryRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  /**
   * Recomputes daily performance metrics and status.
   * Called on every mutation (task complete, habit check, journal save) to ensure 
   * dashboard reads remain <200ms.
   */
  async recompute(userId: string, date: string): Promise<DailyLog> {
    const tasks = await this.taskRepository.findByUserIdAndDate(userId, date);
    const habits = await this.habitRepository.listCompletionsByDate(userId, date);
    const journal = await this.journalRepository.findByUserIdAndDate(userId, date);

    const tasksCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const habitsCompleted = habits.length;

    // Calculate timeframe specific performance (0-100)
    const getTimeframeScore = (tf: Timeframe) => {
      const tfTasks = tasks.filter(t => t.timeframe === tf);
      if (tfTasks.length === 0) return 100; // Neutral if no tasks
      const completed = tfTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      return Math.round((completed / tfTasks.length) * 100);
    };

    // Calculate averages from checkins or fallback to legacy mood/energy fields
    const checkins = (journal as any)?.checkins || {};
    const moods = Object.values(checkins).map((c: any) => c?.mood).filter(m => m !== undefined) as number[];
    const energies = Object.values(checkins).map((c: any) => c?.energy).filter(e => e !== undefined) as number[];
    
    const moodAvg = moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : (journal?.mood || 0);
    const energyAvg = energies.length > 0 ? Math.round(energies.reduce((a, b) => a + b, 0) / energies.length) : (journal?.energy || 0);

    const { total: habitsTotal } = await this.habitRepository.getDailyPerformance(userId, date);

    const log: Partial<DailyLog> = {
      performance: {
        tasksTotal: tasks.length,
        tasksCompleted,
        habitsTotal,
        habitsCompleted,
        distractionMinutes: 0,
        moodAvg,
        energyAvg,
        score: tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0
      },
      timeframeStats: {
        morning: getTimeframeScore(Timeframe.MORNING),
        afternoon: getTimeframeScore(Timeframe.AFTERNOON),
        evening: getTimeframeScore(Timeframe.EVENING),
        night: getTimeframeScore(Timeframe.NIGHT)
      },
      mood: moodAvg || journal?.mood,
      status: (moodAvg || journal?.mood || 5) < 3 ? SystemStatus.RECOVERY : SystemStatus.STABLE,
      updatedAt: new Date()
    };

    return this.logRepository.upsert(userId, date, log);
  }

  async getDashboardData(userId: string, date: string) {
    let log = await this.logRepository.findByUserIdAndDate(userId, date);
    
    // Early morning/First time today - create empty log
    if (!log) {
      await this.recompute(userId, date);
      log = await this.logRepository.findByUserIdAndDate(userId, date);
    }
    
    return log;
  }
}
