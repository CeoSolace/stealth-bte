import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  entryFee: { type: Number, required: true },
  maxPlayers: { type: Number, required: true },
  prizePool: { type: Number, required: true },
  isTournament: { type: Boolean, default: false },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  votes: [{
    voterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    votedAt: { type: Date, default: Date.now }
  }],
  reports: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now }
  }],
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
