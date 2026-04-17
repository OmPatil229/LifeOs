import mongoose, { Schema } from 'mongoose';

const EarlyAccessSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: 'landing_page' }
});

export const EarlyAccessModel = mongoose.model('EarlyAccess', EarlyAccessSchema);
