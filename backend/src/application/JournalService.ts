import { IJournalEntryRepository } from '../domain/repositories/IJournalEntryRepository.js';
import { JournalEntry } from '../domain/entities/JournalEntry.js';
import { DailyLogService } from './DailyLogService.js';

export class JournalService {
  constructor(
    private readonly journalRepository: IJournalEntryRepository,
    private readonly dailyLogService: DailyLogService
  ) {}

  async getEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
    return this.journalRepository.findByUserIdAndDate(userId, date);
  }

  /**
   * Logs a journal entry with mood and energy and updates precomputed stats.
   * This is part of the "Data, not poetry" smart journal system.
   */
  async createOrUpdateEntry(userId: string, date: string, journalData: Partial<JournalEntry>): Promise<JournalEntry> {
    const existing = await this.journalRepository.findByUserIdAndDate(userId, date);
    let entry: JournalEntry;

    if (existing) {
      entry = (await this.journalRepository.update(existing.id, journalData))!;
    } else {
      entry = await this.journalRepository.create({
        ...journalData,
        userId,
        date,
        createdAt: new Date()
      });
    }

    // Update daily log with mood/energy
    await this.dailyLogService.recompute(userId, date);

    return entry;
  }

  async listHistory(userId: string, fromDate: string, toDate: string): Promise<JournalEntry[]> {
    return this.journalRepository.findHistory(userId, fromDate, toDate);
  }

  async searchEntries(userId: string, query: string): Promise<JournalEntry[]> {
    return this.journalRepository.search(userId, query);
  }
}
