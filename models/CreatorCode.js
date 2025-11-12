import mongoose from 'mongoose';

const creatorCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const CreatorCode = mongoose.models.CreatorCode || mongoose.model('CreatorCode', creatorCodeSchema);
