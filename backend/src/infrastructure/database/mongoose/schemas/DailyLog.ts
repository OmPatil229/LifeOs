import mongoose, { Schema } from 'mongoose';

const DailyLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  performance: {
    tasksTotal: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    habitsTotal: { type: Number, default: 0 },
    habitsCompleted: { type: Number, default: 0 },
    distractionMinutes: { type: Number, default: 0 },
    moodAvg: { type: Number, default: 0 },
    energyAvg: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  },
  timeframeStats: {
    morning: { type: Number, default: 0 },
    afternoon: { type: Number, default: 0 },
    evening: { type: Number, default: 0 },
    night: { type: Number, default: 0 }
  },
  intentSnapshot: {
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    plannedTaskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    plannedHabitIds: [{ type: Schema.Types.ObjectId, ref: 'Habit' }]
  },
  status: { type: String, enum: ['stable', 'recovery', 'declining'], default: 'stable' },
  recoveryModeActive: { type: Boolean, default: false },
  burnoutRisk: { type: Number, default: 0 },
  focusHours: { type: Number, default: 0 },
  mood: { type: Number, min: 1, max: 10 }, // 1-tap input
  energy: { type: String, enum: ['low', 'medium', 'high'] }, // 1-tap input
  tags: [{ type: String }], // Stress, sleep quality, etc
  updatedAt: { type: Date, default: Date.now }
});

// Single document read for dashboard
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLogModel = mongoose.model('DailyLog', DailyLogSchema);
