import mongoose, { Schema } from 'mongoose';

const GoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Goal', index: true, default: null },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['year', 'month', 'week', 'day'], required: true, index: true },
  status: { type: String, enum: ['active', 'completed', 'at-risk', 'fail'], default: 'active', index: true },
  targetHours: { type: Number, default: 0 },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, enum: ['health', 'skill', 'business', 'other'], default: 'other' },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  drift: { type: Number, default: 0 },
  targetValue: { type: Number },
  currentValue: { type: Number, default: 0 },
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hierarchy retrieval: find all children for a parent goal
GoalSchema.index({ userId: 1, type: 1, status: 1 });
GoalSchema.index({ userId: 1, parentId: 1 });

export const GoalModel = mongoose.model('Goal', GoalSchema);
