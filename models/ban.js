import mongoose from 'mongoose';

const banSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  expires: { type: Date },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Ban = mongoose.models.Ban || mongoose.model('Ban', banSchema);
