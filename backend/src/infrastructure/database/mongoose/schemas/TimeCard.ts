import mongoose, { Schema, Document } from 'mongoose';
import { TimeLayer } from '../../../../domain/entities/TimeCard.js';

export interface TimeCardDocument extends Document {
  userId: string;
  layer: TimeLayer;
  dateStr: string;
  content: string;
  insight?: string;
  updatedAt: Date;
}

const TimeCardSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  layer: { type: String, required: true, enum: ['day', 'week', 'month', 'year'] },
  dateStr: { type: String, required: true },
  content: { type: String, default: '' },
  insight: { type: String, required: false },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure only one card exists per layer per date for a user
TimeCardSchema.index({ userId: 1, layer: 1, dateStr: 1 }, { unique: true });

export const TimeCardModel = mongoose.model<TimeCardDocument>('TimeCard', TimeCardSchema);
