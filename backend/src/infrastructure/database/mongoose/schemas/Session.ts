import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  moodBefore: { type: Number, min: 1, max: 10 },
  moodAfter: { type: Number, min: 1, max: 10 },
  energyLevel: { type: String, enum: ['low', 'medium', 'high'] },
  focusQuality: { type: Number, min: 1, max: 10 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

SessionSchema.index({ userId: 1, startTime: -1 });

export const SessionModel = mongoose.model('Session', SessionSchema);
