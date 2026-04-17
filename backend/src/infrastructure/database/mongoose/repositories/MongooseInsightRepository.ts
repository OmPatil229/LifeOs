import { InsightModel } from '../schemas/Insight.js';
import { Insight, InsightType, InsightPeriod } from '../../../../domain/entities/Insight.js';
import { IInsightRepository } from '../../../../domain/repositories/IInsightRepository.js';

export class MongooseInsightRepository implements IInsightRepository {
  async findById(id: string): Promise<Insight | null> {
    const doc = await InsightModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserId(userId: string, period?: InsightPeriod): Promise<Insight[]> {
    const query = period ? { userId, period } : { userId };
    const docs = await InsightModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(this.mapToEntity);
  }

  async findByUserIdAndType(userId: string, type: InsightType): Promise<Insight[]> {
    const docs = await InsightModel.find({ userId, type }).sort({ createdAt: -1 }).lean();
    return docs.map(this.mapToEntity);
  }

  async create(insight: Partial<Insight>): Promise<Insight> {
    const doc = await InsightModel.create(insight);
    return this.mapToEntity(doc.toObject());
  }

  async markAsSeen(id: string): Promise<boolean> {
    const result = await InsightModel.updateOne({ _id: id }, { $set: { seenAt: new Date() } });
    return result.modifiedCount > 0;
  }

  async deleteOld(userId: string, olderThan: Date): Promise<number> {
    const result = await InsightModel.deleteMany({ userId, createdAt: { $lt: olderThan } });
    return result.deletedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return InsightModel.countDocuments({ userId, seenAt: null });
  }

  private mapToEntity(doc: any): Insight {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
