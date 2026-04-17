import { DistractionLogModel } from '../schemas/JournalEntryDistraction.js';
import { DistractionLog } from '../../../../domain/entities/DistractionLog.js';
import { IDistractionLogRepository } from '../../../../domain/repositories/IDistractionLogRepository.js';

export class MongooseDistractionLogRepository implements IDistractionLogRepository {
  async findById(id: string): Promise<DistractionLog | null> {
    const doc = await DistractionLogModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserIdAndDate(userId: string, date: string): Promise<DistractionLog[]> {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const docs = await DistractionLogModel.find({
      userId,
      startedAt: { $gte: start, $lt: end }
    }).sort({ startedAt: 1 }).lean();
    return docs.map(this.mapToEntity);
  }

  async create(log: Partial<DistractionLog>): Promise<DistractionLog> {
    const doc = await DistractionLogModel.create(log);
    return this.mapToEntity(doc.toObject());
  }

  async getDailyTotalMinutes(userId: string, date: string): Promise<number> {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const result = await DistractionLogModel.aggregate([
      { $match: { userId: (userId as any), startedAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$durationMinutes" } } }
    ]);
    return result[0]?.total || 0;
  }

  async getWeeklyLossHours(userId: string, fromDate: string, toDate: string): Promise<number> {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setDate(end.getDate() + 1);

    const result = await DistractionLogModel.aggregate([
      { $match: { userId: (userId as any), startedAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$durationMinutes" } } }
    ]);
    return (result[0]?.total || 0) / 60;
  }

  private mapToEntity(doc: any): DistractionLog {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
