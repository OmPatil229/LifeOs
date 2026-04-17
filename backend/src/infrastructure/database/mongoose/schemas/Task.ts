import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal', index: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  timeframe: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true, index: true },
  scheduledTime: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'missed', 'delayed'], default: 'pending', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  energyRequired: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  allocatedHours: { type: Number, default: 0 }, // For Daily Planning System
  trackedTimeMinutes: { type: Number, default: 0 }, // For Actual Time Tracked
  focusLevel: { type: Number, min: 1, max: 10 }, // For Session Tracking
  tags: [{ type: String }],
  isRecommended: { type: Boolean, default: false },
  isCarriedForward: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Fast retrieval for a user's timeline on a specific date
TaskSchema.index({ userId: 1, date: 1 });
TaskSchema.index({ userId: 1, date: 1, timeframe: 1 });
// Fast carry-forward stats queries
TaskSchema.index({ userId: 1, isCarriedForward: 1, date: 1 });

export const TaskModel = mongoose.model('Task', TaskSchema);
