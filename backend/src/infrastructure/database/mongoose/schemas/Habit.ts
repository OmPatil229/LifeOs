import mongoose, { Schema } from 'mongoose';

const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal', index: true, default: null },
  name: { type: String, required: true },
  description: { type: String },
  timeframe: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true, index: true },
  scheduleDays: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
  startTime: { type: String }, // HH:mm
  color: { type: String, default: '#FFFFFF' },
  icon: { type: String, default: '◎' },
  isActive: { type: Boolean, default: true, index: true },
  streakCurrent: { type: Number, default: 0 },
  streakBest: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }, // 0-1
  createdAt: { type: Date, default: Date.now }
});

HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ userId: 1, timeframe: 1 });

export const HabitModel = mongoose.model('Habit', HabitSchema);

const HabitCompletionSchema = new Schema({
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  status: { type: String, enum: ['completed', 'missed'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// One completion per habit per day
HabitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });

export const HabitCompletionModel = mongoose.model('HabitCompletion', HabitCompletionSchema);
