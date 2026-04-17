import { DailyLogModel } from '../schemas/DailyLog.js';
import { DailyLog, SystemStatus } from '../../../../domain/entities/DailyLog.js';
import { IDailyLogRepository } from '../../../../domain/repositories/IDailyLogRepository.js';

export class MongooseDailyLogRepository implements IDailyLogRepository {
  async findByUserIdAndDate(userId: string, date: string): Promise<DailyLog | null> {
    const doc = await DailyLogModel.findOne({ userId, date }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async upsert(userId: string, date: string, log: Partial<DailyLog>): Promise<DailyLog> {
    const doc = await DailyLogModel.findOneAndUpdate(
      { userId, date },
      { $set: log },
      { upsert: true, new: true }
    ).lean();
    return this.mapToEntity(doc);
  }

  async findByUserIdAndDateRange(userId: string, fromDate: string, toDate: string): Promise<DailyLog[]> {
    const docs = await DailyLogModel.find({ 
      userId, 
      date: { $gte: fromDate, $lte: toDate } 
    }).sort({ date: 1 }).lean();
    return docs.map(this.mapToEntity);
  }

  async updateStatus(userId: string, date: string, status: SystemStatus, recoveryModeActive: boolean): Promise<DailyLog | null> {
    const doc = await DailyLogModel.findOneAndUpdate(
      { userId, date },
      { $set: { status, recoveryModeActive } },
      { new: true }
    ).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async getAverageMood(userId: string, fromDate: string, toDate: string): Promise<number> {
    const result = await DailyLogModel.aggregate([
      { $match: { userId, date: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: null, avgMood: { $avg: "$performance.moodAvg" } } }
    ]);
    return result[0]?.avgMood || 0;
  }

  async getAverageEnergy(userId: string, fromDate: string, toDate: string): Promise<number> {
    const result = await DailyLogModel.aggregate([
      { $match: { userId, date: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: null, avgEnergy: { $avg: "$performance.energyAvg" } } }
    ]);
    return result[0]?.avgEnergy || 0;
  }

  private mapToEntity(doc: any): DailyLog {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
