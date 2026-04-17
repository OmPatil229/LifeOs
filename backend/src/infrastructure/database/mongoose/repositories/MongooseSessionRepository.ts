import { SessionModel } from '../schemas/Session.js';
import { Session } from '../../../../domain/entities/Session.js';
import { ISessionRepository } from '../../../../domain/repositories/ISessionRepository.js';

export class MongooseSessionRepository implements ISessionRepository {
  async findById(id: string): Promise<Session | null> {
    const doc = await SessionModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const docs = await SessionModel.find({ userId }).sort({ startTime: -1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findActiveByUserId(userId: string): Promise<Session | null> {
    const doc = await SessionModel.findOne({ userId, endTime: { $exists: false } }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(session: Partial<Session>): Promise<Session> {
    const doc = await SessionModel.create(session);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, session: Partial<Session>): Promise<Session | null> {
    const doc = await SessionModel.findByIdAndUpdate(id, session, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await SessionModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  private mapToEntity(doc: any): Session {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
