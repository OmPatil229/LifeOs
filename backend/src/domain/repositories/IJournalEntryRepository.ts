import { JournalEntry } from '../entities/JournalEntry.js';

export interface IJournalEntryRepository {
  findById(id: string): Promise<JournalEntry | null>;
  findByUserIdAndDate(userId: string, date: string): Promise<JournalEntry | null>;
  create(entry: Partial<JournalEntry>): Promise<JournalEntry>;
  update(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry | null>;
  delete(id: string): Promise<boolean>;
  findHistory(userId: string, fromDate: string, toDate: string): Promise<JournalEntry[]>;
  search(userId: string, query: string, limit?: number): Promise<JournalEntry[]>;
}
