import { EnergyLevel } from './Task.js';

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5 (Overall/Average)
  energy: number; // 1-7 or 1-5 (Overall/Average)
  content: string;
  tags: string[];
  checkins?: {
    morning?: { mood: number, energy: number },
    afternoon?: { mood: number, energy: number },
    evening?: { mood: number, energy: number },
    night?: { mood: number, energy: number }
  };
  correlations: {
    patternId: string;
    description: string;
    correlationValue: number; // 0-1
  }[];
  createdAt: Date;
}
