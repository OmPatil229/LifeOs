export interface Session {
  id: string;
  userId: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  moodBefore?: number;
  moodAfter?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  focusQuality?: number;
  tags: string[];
  createdAt: Date;
}
