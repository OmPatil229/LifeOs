import { ITimeCardRepository } from '../../../../domain/repositories/ITimeCardRepository.js';
import { TimeCard, TimeLayer } from '../../../../domain/entities/TimeCard.js';
import { TimeCardModel, TimeCardDocument } from '../schemas/TimeCard.js';

export class MongooseTimeCardRepository implements ITimeCardRepository {
  private mapToDomain(doc: TimeCardDocument): TimeCard {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      layer: doc.layer,
      dateStr: doc.dateStr,
      content: doc.content,
      insight: doc.insight,
      updatedAt: doc.updatedAt
    };
  }

  async findByUserLayerAndDate(userId: string, layer: TimeLayer, dateStr: string): Promise<TimeCard | null> {
    const doc = await TimeCardModel.findOne({ userId, layer, dateStr }).exec();
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async upsert(userId: string, layer: TimeLayer, dateStr: string, content: string, insight?: string): Promise<TimeCard> {
    const doc = await TimeCardModel.findOneAndUpdate(
      { userId, layer, dateStr },
      { content, insight, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return this.mapToDomain(doc);
  }
}
