import { TaskModel } from '../schemas/Task.js';
import { Task, TaskStatus } from '../../../../domain/entities/Task.js';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository.js';

export class MongooseTaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    const doc = await TaskModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserIdAndDate(userId: string, date: string): Promise<Task[]> {
    const docs = await TaskModel.find({ userId, date }).sort({ timeframe: 1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findByUserIdAndDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    const docs = await TaskModel.find({ 
      userId, 
      date: { $gte: startDate, $lte: endDate } 
    }).sort({ date: 1, timeframe: 1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async create(task: Partial<Task>): Promise<Task> {
    const doc = await TaskModel.create(task);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, task: Partial<Task>): Promise<Task | null> {
    const doc = await TaskModel.findByIdAndUpdate(id, task, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TaskModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const doc = await TaskModel.findByIdAndUpdate(id, { status, completedAt: status === TaskStatus.COMPLETED ? new Date() : null }, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async countByUserIdAndDateAndStatus(userId: string, date: string, status: TaskStatus): Promise<number> {
    return TaskModel.countDocuments({ userId, date, status });
  }

  async countTotalByUserIdAndDate(userId: string, date: string): Promise<number> {
    return TaskModel.countDocuments({ userId, date });
  }

  async findByGoalId(goalId: string): Promise<Task[]> {
    const docs = await TaskModel.find({ goalId }).sort({ date: 1, timeframe: 1 }).lean();
    return docs.map(this.mapToEntity);
  }

  /**
   * Finds all pending/missed tasks with dates strictly before the given date.
   * Powers the auto-carry-forward system: any overdue incomplete task
   * gets moved to today when the user loads their timeline.
   */
  async findIncompleteBeforeDate(userId: string, beforeDate: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      userId,
      date: { $lt: beforeDate },
      status: { $in: ['pending', 'missed'] }
    }).sort({ date: 1, timeframe: 1 }).lean();
    return docs.map(this.mapToEntity);
  }

  /**
   * Counts tasks marked as carried forward within a date range.
   * Used for week/month/year carry-forward statistics.
   */
  async countCarriedForwardByDateRange(userId: string, startDate: string, endDate: string): Promise<number> {
    return TaskModel.countDocuments({
      userId,
      isCarriedForward: true,
      date: { $gte: startDate, $lte: endDate }
    });
  }

  private mapToEntity(doc: any): Task {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
