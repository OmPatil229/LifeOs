import { HabitModel, HabitCompletionModel } from '../schemas/Habit.js';
import { Habit, HabitCompletion } from '../../../../domain/entities/Habit.js';
import { IHabitRepository } from '../../../../domain/repositories/IHabitRepository.js';

export class MongooseHabitRepository implements IHabitRepository {
  async findById(id: string): Promise<Habit | null> {
    const doc = await HabitModel.findById(id).lean();
    return doc ? this.mapHabitToEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Habit[]> {
    const docs = await HabitModel.find({ userId, isActive: true }).lean();
    return docs.map(this.mapHabitToEntity);
  }

  async findByUserIdAndDay(userId: string, day: number): Promise<Habit[]> {
    const docs = await HabitModel.find({ userId, scheduleDays: day, isActive: true }).lean();
    return docs.map(this.mapHabitToEntity);
  }

  async create(habit: Partial<Habit>): Promise<Habit> {
    const doc = await HabitModel.create(habit);
    return this.mapHabitToEntity(doc.toObject());
  }

  async update(id: string, habit: Partial<Habit>): Promise<Habit | null> {
    const doc = await HabitModel.findByIdAndUpdate(id, habit, { new: true }).lean();
    return doc ? this.mapHabitToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await HabitModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async logCompletion(completion: Partial<HabitCompletion>): Promise<HabitCompletion> {
    const doc = await HabitCompletionModel.findOneAndUpdate(
      { habitId: completion.habitId, date: completion.date },
      { $set: completion },
      { upsert: true, new: true }
    ).lean();
    return this.mapCompletionToEntity(doc);
  }

  async getCompletionForDate(habitId: string, date: string): Promise<HabitCompletion | null> {
    const doc = await HabitCompletionModel.findOne({ habitId, date }).lean();
    return doc ? this.mapCompletionToEntity(doc) : null;
  }

  async getDailyPerformance(userId: string, date: string): Promise<{ total: number, completed: number }> {
    const day = new Date(date).getDay();
    const [total, completed] = await Promise.all([
      HabitModel.countDocuments({ userId, scheduleDays: day, isActive: true }),
      HabitCompletionModel.countDocuments({ userId, date, status: 'completed' })
    ]);
    return { total, completed };
  }

  async updateStreak(id: string, streak: number, bestStreak: number): Promise<Habit | null> {
    const doc = await HabitModel.findByIdAndUpdate(id, {
      streakCurrent: streak,
      streakBest: bestStreak
    }, { new: true }).lean();
    return doc ? this.mapHabitToEntity(doc) : null;
  }

  async listCompletionsByDate(userId: string, date: string): Promise<HabitCompletion[]> {
    const docs = await HabitCompletionModel.find({ userId, date, status: 'completed' }).lean();
    return docs.map(doc => this.mapCompletionToEntity(doc));
  }

  async findByGoalId(goalId: string): Promise<Habit[]> {
    const docs = await HabitModel.find({ goalId, isActive: true }).lean();
    return docs.map(this.mapHabitToEntity);
  }

  async countCompletionsForGoalInRange(goalId: string, startDate: string, endDate: string): Promise<{ total: number; completed: number }> {
    const habits = await this.findByGoalId(goalId);
    if (habits.length === 0) return { total: 0, completed: 0 };

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    // 1. Calculate how many times these habits were scheduled in the range
    let totalScheduled = 0;
    const tempDate = new Date(start);
    while (tempDate <= end) {
      const dayOfWeek = tempDate.getDay();
      for (const habit of habits) {
        if (habit.scheduleDays.includes(dayOfWeek)) {
          totalScheduled++;
        }
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // 2. Count actual completions in the range for these habits
    const habitIds = habits.map(h => h.id);
    const completedCount = await HabitCompletionModel.countDocuments({
      habitId: { $in: habitIds },
      date: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    return { total: totalScheduled, completed: completedCount };
  }

  private mapHabitToEntity(doc: any): Habit {
    const { _id, goalId, ...rest } = doc;
    return { 
      id: _id.toString(), 
      goalId: goalId ? goalId.toString() : undefined,
      ...rest 
    };
  }

  private mapCompletionToEntity(doc: any): HabitCompletion {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
