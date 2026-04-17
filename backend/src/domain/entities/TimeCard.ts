export type TimeLayer = 'day' | 'week' | 'month' | 'year';

export interface TimeCard {
  id: string;
  userId: string;
  layer: TimeLayer;
  dateStr: string; // Dynamic identifier for the period, e.g. "2026-03-25" or "2026-W12"
  content: string;
  insight?: string;
  updatedAt: Date;
}
