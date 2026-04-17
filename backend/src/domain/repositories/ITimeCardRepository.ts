import { TimeCard, TimeLayer } from '../entities/TimeCard.js';

export interface ITimeCardRepository {
  findByUserLayerAndDate(userId: string, layer: TimeLayer, dateStr: string): Promise<TimeCard | null>;
  upsert(userId: string, layer: TimeLayer, dateStr: string, content: string, insight?: string): Promise<TimeCard>;
}
