import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['coin_purchase', 'match_entry', 'match_prize', 'creator_bonus', 'discord_transfer', 'withdrawal']
  },
  amount: { type: Number, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  stripeSessionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
