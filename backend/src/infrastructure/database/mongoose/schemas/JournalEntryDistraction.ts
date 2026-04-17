import mongoose, { Schema } from 'mongoose';

const JournalEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  mood: { type: Number, min: 1, max: 5 },
  energy: { type: Number, min: 1, max: 7 },
  checkins: {
    morning: { mood: Number, energy: Number },
    afternoon: { mood: Number, energy: Number },
    evening: { mood: Number, energy: Number },
    night: { mood: Number, energy: Number }
  },
  content: { type: String, default: '' },
  tags: [{ type: String }],
  correlations: [{
    patternId: { type: String },
    description: { type: String },
    correlationValue: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

JournalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
JournalEntrySchema.index({ content: 'text', tags: 'text' });

export const JournalEntryModel = mongoose.model('JournalEntry', JournalEntrySchema);

const DistractionLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, required: true, index: true },
  endedAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, index: true },
  category: { type: String, required: true, index: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

DistractionLogSchema.index({ userId: 1, startedAt: 1 });

export const DistractionLogModel = mongoose.model('DistractionLog', DistractionLogSchema);
