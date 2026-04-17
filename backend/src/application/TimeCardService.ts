import { ITimeCardRepository } from '../domain/repositories/ITimeCardRepository.js';
import { TimeCard, TimeLayer } from '../domain/entities/TimeCard.js';
import { InsightService } from './InsightService.js';

export class TimeCardService {
  constructor(
    private readonly timeCardRepository: ITimeCardRepository,
    private readonly insightService: InsightService
  ) {}

  async getCard(userId: string, layer: TimeLayer, dateStr: string): Promise<TimeCard> {
    let card = await this.timeCardRepository.findByUserLayerAndDate(userId, layer, dateStr);
    if (!card) {
      // Return an empty card representation if none exists yet
      return {
        id: '',
        userId,
        layer,
        dateStr,
        content: '',
        updatedAt: new Date()
      };
    }
    return card;
  }

  async saveCard(userId: string, layer: TimeLayer, dateStr: string, content: string): Promise<TimeCard> {
    // Generate a personalized insight dynamically before saving
    const insight = await this.insightService.generatePersonalizedInsight(layer, content);
    
    return this.timeCardRepository.upsert(userId, layer, dateStr, content, insight);
  }
}
