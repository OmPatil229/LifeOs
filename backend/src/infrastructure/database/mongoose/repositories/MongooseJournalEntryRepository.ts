import { JournalEntryModel } from '../schemas/JournalEntryDistraction.js';
import { JournalEntry } from '../../../../domain/entities/JournalEntry.js';
import { IJournalEntryRepository } from '../../../../domain/repositories/IJournalEntryRepository.js';

export class MongooseJournalEntryRepository implements IJournalEntryRepository {
  async findById(id: string): Promise<JournalEntry | null> {
    const doc = await JournalEntryModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserIdAndDate(userId: string, date: string): Promise<JournalEntry | null> {
    const doc = await JournalEntryModel.findOne({ userId, date }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const doc = await JournalEntryModel.create(entry);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const doc = await JournalEntryModel.findByIdAndUpdate(id, entry, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await JournalEntryModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async findHistory(userId: string, fromDate: string, toDate: string): Promise<JournalEntry[]> {
    const docs = await JournalEntryModel.find({
      userId,
      date: { $gte: fromDate, $lte: toDate }
    }).sort({ date: -1 }).lean();
    return docs.map(this.mapToEntity);
  }

  async search(userId: string, query: string, limit: number = 20): Promise<JournalEntry[]> {
    if (!query) return [];
    
    const docs = await JournalEntryModel.find(
      { userId, $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();
    
    return docs.map(this.mapToEntity);
  }

  private mapToEntity(doc: any): JournalEntry {
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }
}
