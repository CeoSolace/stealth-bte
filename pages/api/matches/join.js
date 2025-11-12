import { connectToDatabase } from '../../../lib/mongodb';
import { Match } from '../../../models/Match';
import { User } from '../../../models/User';
import { Transaction } from '../../../models/Transaction';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { matchId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'active') {
      return res.status(400).json({ error: 'Match is not active' });
    }

    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({ error: 'Match is full' });
    }

    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already joined
    if (match.players.some(p => p.userId.toString() === user._id.toString())) {
      return res.status(400).json({ error: 'Already joined this match' });
    }

    if (user.coins < match.entryFee) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Check if users who played together before are friends (to avoid match prevention)
    const existingPlayerIds = match.players.map(p => p.userId);
    for (const playerId of existingPlayerIds) {
      const playedTogether = await Match.find({
        players: { $all: [user._id, playerId] },
        $or: [
          { 'reports.from': user._id, 'reports.to': playerId },
          { 'reports.from': playerId, 'reports.to': user._id }
        ]
      });

      if (playedTogether.length > 0) {
        // Check if they are friends
        const userFriends = await User.findById(user._id).select('friends');
        if (!userFriends.friends.includes(playerId)) {
          return res.status(400).json({ error: 'Cannot join match with reported cheater' });
        }
      }
    }

    // Deduct entry fee
    user.coins -= match.entryFee;
    await user.save();

    // Add user to match
    match.players.push({
      userId: user._id,
      joinedAt: new Date()
    });
    await match.save();

    // Create transaction
    const transaction = new Transaction({
      type: 'match_entry',
      amount: match.entryFee,
      from: user._id,
      to: null,
      description: `Entry fee for match: ${match.title}`
    });
    await transaction.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
