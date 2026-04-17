import { IInsightRepository } from '../domain/repositories/IInsightRepository.js';
import { ITaskRepository } from '../domain/repositories/ITaskRepository.js';
import { IHabitRepository } from '../domain/repositories/IHabitRepository.js';
import { IDailyLogRepository } from '../domain/repositories/IDailyLogRepository.js';
import { ISessionRepository } from '../domain/repositories/ISessionRepository.js';
import { IGoalRepository } from '../domain/repositories/IGoalRepository.js';
import { Insight, InsightType, InsightPeriod } from '../domain/entities/Insight.js';
import { EnergyLevel, TaskStatus, Priority } from '../domain/entities/Task.js';
import { TimeLayer } from '../domain/entities/TimeCard.js';
import { JournalEntryModel } from '../infrastructure/database/mongoose/schemas/JournalEntryDistraction.js';

export class InsightService {
  constructor(
    private readonly insightRepository: IInsightRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly habitRepository: IHabitRepository,
    private readonly dailyLogRepository: IDailyLogRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly goalRepository: IGoalRepository
  ) {}

  /**
   * CORE DECISION ENGINE logic.
   */
  async getBestNextAction(userId: string, energy: EnergyLevel): Promise<{ title: string; subtitle: string; taskId?: string }> {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await this.taskRepository.findByUserIdAndDate(userId, today);
    const habits = await this.habitRepository.findByUserId(userId);

    // 1. Check for habits at risk (Streak preservation)
    const activeHabits = habits.filter(h => h.isActive);
    const atRiskHabit = activeHabits.find(h => h.streakCurrent >= 3); 

    if (atRiskHabit && energy !== EnergyLevel.LOW) {
      return {
        title: `Protect ${atRiskHabit.name} Streak`,
        subtitle: `You have a ${atRiskHabit.streakCurrent}-day momentum. Don't let it reset today.`
      };
    }

    // 2. High Energy deep work check (Capacity matching)
    if (energy === EnergyLevel.HIGH) {
      const complexTask = tasks.find(t => 
        t.status === TaskStatus.PENDING && 
        (t.energyRequired === EnergyLevel.HIGH || t.priority === Priority.HIGH)
      );
      if (complexTask) {
        return {
          title: `Deep Work: ${complexTask.title}`,
          subtitle: `Your brain is at peak capacity. Tackle this high-leverage task now.`,
          taskId: complexTask.id
        };
      }
    }

    // 3. Low Energy recovery check (Decision Integrity)
    if (energy === EnergyLevel.LOW) {
      const quickTask = tasks.find(t => 
        t.status === TaskStatus.PENDING && 
        (t.energyRequired === EnergyLevel.LOW || t.title.toLowerCase().includes('email') || t.title.toLowerCase().includes('admin'))
      );
      if (quickTask) {
        return {
          title: `Quick Win: ${quickTask.title}`,
          subtitle: `Low energy detected. Clean up this administrative task to maintain momentum.`,
          taskId: quickTask.id
        };
      }
    }

    // 4. Default fallback to priority
    const nextTask = tasks
      .filter(t => t.status === TaskStatus.PENDING)
      .sort((a, b) => {
        const priorityScore: Record<Priority, number> = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      })[0];
      
    if (nextTask) {
      return {
        title: `Next Up: ${nextTask.title}`,
        subtitle: `Focus on your highest priority pending objective.`
      };
    }

    return {
        title: `Daily Objectives Met`,
        subtitle: `System integrity is high. Use this window for recovery or future planning.`
    };
  }

  /**
   * AI/Rules engine to generate a personalized insight from the user's typed card data.
   */
  async generatePersonalizedInsight(layer: TimeLayer, content: string): Promise<string> {
    if (!content || content.length < 10) return '';
    const lowerContent = content.toLowerCase();
    
    if (layer === 'day') {
      if (lowerContent.includes('urgent') || lowerContent.includes('asap') || lowerContent.includes('deadline')) {
        return '⚡ High intensity day detected. Ensure you take a 15 min break every 90 mins to maintain decision quality.';
      }
      if (lowerContent.includes('read') || lowerContent.includes('learn') || lowerContent.includes('research')) {
        return '🧠 Deep learning day. Good for long-term neuroplasticity. Avoid checking email before noon.';
      }
      if (lowerContent.includes('meeting') || lowerContent.includes('call') || lowerContent.includes('interview')) {
        return '🤝 Social overhead detected. Expect lower deep work capacity. Protect your buffers.';
      }
      return '🎯 Focus items detected. Protect your core deep work hours from incremental entropy.';
    }
    
    if (layer === 'week') {
      if (lowerContent.includes('launch') || lowerContent.includes('release') || lowerContent.includes('ship')) {
        return '🚀 Launch week momentum. Prioritize recovery focus in the evenings to prevent cognitive debt.';
      }
      return '📅 Weekly trajectory set. Ensure daily habits align with this intent or the drift will accumulate.';
    }

    if (layer === 'month') {
      if (lowerContent.includes('mrr') || lowerContent.includes('revenue') || lowerContent.includes('growth')) {
        return '💼 Strong business growth focus. Track lagging indicators closely but obsess over leading activities.';
      }
      if (lowerContent.includes('health') || lowerContent.includes('gym') || lowerContent.includes('training')) {
        return '💪 Physical output requires recovery. Do not neglect sleep hygiene during this high-intensity phase.';
      }
      return '📅 A balanced month ahead. Pace yourself to prevent end-of-month burnout.';
    }

    if (layer === 'year') {
      return '🔭 Macro perspective is set. Check back weekly to ensure your tactical daily execution follows this azimuth.';
    }

    return '';
  }

  // --- REAL DATA INSIGHT ENGINE ---

  async calculatePlanningAccuracy(userId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const log = await this.dailyLogRepository.findByUserIdAndDate(userId, today);
    const tasks = await this.taskRepository.findByUserIdAndDate(userId, today);
    
    if (!log || !log.intentSnapshot || !log.intentSnapshot.isLocked) {
      // Legacy or unlocked fallback
      const planned = tasks.reduce((sum, t) => sum + (t.allocatedHours || 0), 0);
      const actual = tasks.reduce((sum, t) => sum + (t.trackedTimeMinutes || 0), 0) / 60;
      let text = 'No tasks planned today.';
      if (planned > 0) {
        const accuracy = Math.round((actual / planned) * 100);
        if (accuracy < 50) text = `You overestimate your capacity by ${100 - accuracy}%`;
        else if (accuracy > 150) text = `You underestimate your capacity by ${accuracy - 100}%`;
        else text = `Planning accuracy is high: ${accuracy}%`;
      }
      return { isLocked: false, text, score: 0, plannedCount: 0, completedCount: 0, reactiveCount: 0 };
    }

    const { plannedTaskIds } = log.intentSnapshot;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    
    // Tasks that were planned and completed
    const completedPlannedCount = completedTasks.filter(t => plannedTaskIds.includes(t.id)).length;
    // Tasks that were completed but NOT planned
    const reactiveCount = completedTasks.filter(t => !plannedTaskIds.includes(t.id)).length;
    
    let score = 0;
    if (plannedTaskIds.length > 0) {
      score = Math.round((completedPlannedCount / plannedTaskIds.length) * 100);
    }
    
    return {
      isLocked: true,
      score,
      plannedCount: plannedTaskIds.length,
      completedCount: completedPlannedCount,
      reactiveCount,
      text: `${score}% Execution Integrity. ${reactiveCount} unplanned tasks.`
    };
  }

  /**
   * Locks the daily plan snapshot
   */
  async commitDailyPlan(userId: string, date: string): Promise<any> {
    const tasks = await this.taskRepository.findByUserIdAndDate(userId, date);
    const habits = await this.habitRepository.findByUserId(userId);
    
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).map(t => t.id);
    const activeHabits = habits.filter(h => h.isActive).map(h => h.id);
    
    const intentSnapshot = {
      isLocked: true,
      lockedAt: new Date(),
      plannedTaskIds: pendingTasks,
      plannedHabitIds: activeHabits
    };
    
    await this.dailyLogRepository.upsert(userId, date, { intentSnapshot } as any);
    return intentSnapshot;
  }

  /**
   * 2. Mood vs Productivity
   */
  async analyzeMoodVsProductivity(userId: string): Promise<string> {
    const trend = await this.getProductivityTrend(userId, 7);
    const validDays = trend.filter(d => d.mood > 0 && d.totalCount > 0);

    if (validDays.length < 3) return 'Need 3+ days of mood/task data for correlation.';
    
    // Calculate correlations
    const highMoodDays = validDays.filter(d => d.mood >= 7);
    const lowMoodDays = validDays.filter(d => d.mood < 5);
    
    const avgHighProd = highMoodDays.reduce((s,d) => s + d.productivity, 0) / (highMoodDays.length || 1);
    const avgLowProd = lowMoodDays.reduce((s,d) => s + d.productivity, 0) / (lowMoodDays.length || 1);

    if (avgHighProd > avgLowProd + 20) {
      return `Pattern Verified: Your completion rate increases by ${Math.round(avgHighProd - avgLowProd)}% on high-mood days.`;
    }
    
    return `Mood level ${trend[trend.length-1].mood} correlates with ${trend[trend.length-1].completionCount} tasks yesterday.`;
  }

  /**
   * 3. Time-of-Day Analysis
   */
  async analyzePeakProductivity(userId: string): Promise<string> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    if (sessions.length === 0) return 'No sessions tracked yet.';

    const highQualitySessions = sessions.filter(s => (s.focusQuality || 0) > 7);
    if (highQualitySessions.length === 0) return 'Keep tracking sessions to find your peak focus window.';

    // Find most common hour
    const hours = highQualitySessions.map(s => s.startTime.getHours());
    const mostCommonHour = hours.sort((a,b) =>
          hours.filter(v => v===a).length - hours.filter(v => v===b).length
      ).pop();

    return `Peak productivity detected around ${mostCommonHour}:00`;
  }

  /**
   * 4. Habit Consistency analysis
   */
  async calculateHabitPerformance(userId: string, date: string): Promise<string> {
    const { total, completed } = await this.habitRepository.getDailyPerformance(userId, date);
    if (total === 0) return 'No habits scheduled today.';
    return `${completed}/${total} Habits Complete`;
  }

  /**
   * 5. Focus Quality Score
   */
  async calculateFocusQuality(userId: string): Promise<{ score: number; label: string }> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    if (sessions.length === 0) return { score: 0, label: 'No Data' };

    const avg = sessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) / sessions.length;
    return { 
      score: Math.round(avg * 10), 
      label: avg > 7 ? 'Deep Focus' : 'Scattered' 
    };
  }

  /**
   * 5. Burnout Warning
   */
  async evaluateBurnoutRisk(userId: string): Promise<string | null> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    const recent = sessions.slice(0, 5);
    const avgMood = recent.reduce((sum, s) => sum + (s.moodAfter || 5), 0) / recent.length;

    if (avgMood < 4) {
      return `⚠️ High Burnout Risk: Recent session moods are consistently low. Recommend immediate recovery.`;
    }
    return null;
  }

  /**
   * 6. Failure Reason Engine
   */
  async generateDailyFailureReason(userId: string, date: string): Promise<string> {
    const log = await this.dailyLogRepository.findByUserIdAndDate(userId, date);
    if (!log) return 'No log found for this date.';

    const reasons = [];
    if (log.energy && log.energy === 'low') reasons.push('Low energy (recorded)');
    if (log.performance.tasksCompleted < log.performance.tasksTotal / 2) reasons.push('Overplanning (volume > capacity)');
    if (log.performance.distractionMinutes > 60) reasons.push('Distraction (high volume detected)');

    if (reasons.length === 0) return 'Outcome optimized. No failure patterns detected.';
    return `Potential failure causes: ${reasons.join(', ')}`;
  }

  /**
   * 7. Productivity Trend Analysis (Mood vs Goal Completion)
   */
  async getProductivityTrend(userId: string, days: number = 7): Promise<any[]> {
    const trend = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const [log, tasks] = await Promise.all([
        this.dailyLogRepository.findByUserIdAndDate(userId, dateStr),
        this.taskRepository.findByUserIdAndDate(userId, dateStr)
      ]);

      const goalTasks = tasks.filter(t => t.allocatedHours && t.allocatedHours > 0);
      const completions = goalTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const total = goalTasks.length;
      const completionRate = total > 0 ? Math.round((completions / total) * 100) : 0;

      trend.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: log?.mood || 5, // Default to middle if no data
        productivity: completionRate,
        completionCount: completions,
        totalCount: total
      });
    }

    return trend;
  }

  /**
   * 8. Historical Trajectory (For visual grid)
   */
  async getTrajectory(userId: string, type: 'month' | 'year'): Promise<number[]> {
    const periodCount = type === 'month' ? 4 : 12;
    const trajectory = [];
    
    for (let i = periodCount - 1; i >= 0; i--) {
        const trend = await this.getProductivityTrend(userId, type === 'month' ? 7 : 30);
        // This is a bit simplified, but calculates the average productivity for that period
        const avg = trend.reduce((s, d) => s + d.productivity, 0) / (trend.length || 1);
        trajectory.push(Math.round(avg));
    }
    
    return trajectory;
  }

  /**
   * 9. Capacity Gain Calculation (Tracked Focus Hours Projected)
   */
  async calculateCapacityGain(userId: string): Promise<number> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Total focus hours in last 30 days
    const recentSessions = sessions.filter(s => s.startTime > last30Days);
    const totalMinutes = recentSessions.reduce((sum, s) => {
      const end = s.endTime || new Date();
      return sum + (end.getTime() - s.startTime.getTime()) / (1000 * 60);
    }, 0);
    return Math.round((totalMinutes / 60) * 10) / 10; // 1 decimal point
  }

  /**
   * 10. Consistency Rate (Habit adherence across 30 days)
   */
  async calculateConsistencyRate(userId: string): Promise<number> {
    const now = new Date();
    let totalScheduled = 0;
    let totalCompleted = 0;

    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const { total, completed } = await this.habitRepository.getDailyPerformance(userId, d.toISOString().split('T')[0]);
      totalScheduled += total;
      totalCompleted += completed;
    }

    if (totalScheduled === 0) return 0;
    return Math.round((totalCompleted / totalScheduled) * 100);
  }

  /**
   * 11. Efficiency Factor (Recent Productivity vs Baseline)
   */
  async calculateEfficiencyFactor(userId: string): Promise<number> {
    const trend = await this.getProductivityTrend(userId, 7);
    const avg = trend.reduce((s, d) => s + d.productivity, 0) / (trend.length || 1);
    
    // Baseline is 1.0 (50% productivity baseline)
    const factor = (avg / 50);
    return Math.round(factor * 100) / 100;
  }

  /**
   * 12. Strategic Focus Mix (Calculates distribution of active goals)
   */
  async calculateFocusMix(userId: string): Promise<{ label: string; value: number }[]> {
    const goals = await this.goalRepository.findByUserId(userId);
    if (goals.length === 0) return [];

    const types = ['year', 'month', 'week'];
    const distribution = types.map(type => {
      const count = goals.filter(g => g.type === type).length;
      return {
        label: type.toUpperCase(),
        value: Math.round((count / goals.length) * 100)
      };
    });

    return distribution.filter(d => d.value > 0);
  }

  /**
   * 13. Biometric Trend analysis (Mood/Energy averages over time)
   */
  async getBiometricTrend(userId: string, days: number): Promise<{ mood: number[]; energy: number[] }> {
    const now = new Date();
    const mood: number[] = [];
    const energy: number[] = [];

    for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        
        const log = await JournalEntryModel.findOne({ userId, date: dateStr });
        
        if (log) {
            // Calculate averge if checkins exist, else use base journal mood
            let totalMood = log.mood || 0;
            let totalEnergy = log.energy || 0;
            let count = 1;

            if (log.checkins) {
                const checkinsMap = log.checkins as any;
                ['morning', 'afternoon', 'evening', 'night'].forEach(period => {
                    if (checkinsMap[period]) {
                        if (checkinsMap[period].mood) { totalMood += checkinsMap[period].mood; count++; }
                        if (checkinsMap[period].energy) { totalEnergy += checkinsMap[period].energy; count++; }
                    }
                });
            }

            mood.push(Math.round((totalMood / Math.max(1, count)) * 10) / 10);
            energy.push(Math.round((totalEnergy / Math.max(1, count)) * 10) / 10);
        } else {
            mood.push(0);
            energy.push(0);
        }
    }
    
    return { mood, energy };
  }
}
