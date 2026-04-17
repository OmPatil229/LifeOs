import { GoalModel } from '../schemas/Goal.js';
import { Goal, GoalStatus } from '../../../../domain/entities/Goal.js';
import { IGoalRepository } from '../../../../domain/repositories/IGoalRepository.js';

export class MongooseGoalRepository implements IGoalRepository {
  async findById(id: string): Promise<Goal | null> {
    const doc = await GoalModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const docs = await GoalModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findByUserIdAndType(userId: string, type: 'year' | 'month' | 'week' | 'day'): Promise<Goal[]> {
    const docs = await GoalModel.find({ userId, type }).sort({ createdAt: -1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async create(goal: Partial<Goal>): Promise<Goal> {
    const doc = await GoalModel.create(goal);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, goal: Partial<Goal>): Promise<Goal | null> {
    const doc = await GoalModel.findByIdAndUpdate(id, goal, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await GoalModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async updateProgress(id: string, progress: number, status: GoalStatus): Promise<Goal | null> {
    const doc = await GoalModel.findByIdAndUpdate(id, {
      progressPercentage: progress,
      status
    }, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findHierarchy(userId: string, date: string): Promise<Goal[]> {
    // Basic implementation: find all active goals for a user
    const docs = await GoalModel.find({ userId, status: { $ne: GoalStatus.FAIL } }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findByParentId(parentId: string): Promise<Goal[]> {
    const docs = await GoalModel.find({ parentId }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }


  private mapToEntity(doc: any): Goal {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
