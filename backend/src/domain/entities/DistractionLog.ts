export interface DistractionLog {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date;
  durationMinutes: number;
  category: string; // social, entertainment, idle, work-about-work
  note?: string;
  createdAt: Date;
}
