import mongoose, { Schema } from 'mongoose';

const InsightSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  type: { type: String, enum: ['pattern', 'suggestion', 'recovery_status', 'social_benchmark'], required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionableSuggestion: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  seenAt: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

InsightSchema.index({ userId: 1, period: 1, date: 1 });
InsightSchema.index({ userId: 1, type: 1, seenAt: 1 });

export const InsightModel = mongoose.model('Insight', InsightSchema);
