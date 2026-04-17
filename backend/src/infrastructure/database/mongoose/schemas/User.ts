import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  timezone: { type: String, default: 'UTC' },
  hasOnboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


export const UserModel = mongoose.model('User', UserSchema);
