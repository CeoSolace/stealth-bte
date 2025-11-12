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

    const { matchId, winnerId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'active' && match.status !== 'completed') {
      return res.status(400).json({ error: 'Match is not in voting phase' });
    }

    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user participated in match
    const userParticipated = match.players.some(p => p.userId.toString() === user._id.toString());
    if (!userParticipated) {
      return res.status(400).json({ error: 'User did not participate in this match' });
    }

    // Check if user already voted
    const userAlreadyVoted = match.votes.some(v => v.voterId.toString() === user._id.toString());
    if (userAlreadyVoted) {
      return res.status(400).json({ error: 'User already voted' });
    }

    // Check if winner is valid participant
    const winnerExists = match.players.some(p => p.userId.toString() === winnerId);
    if (!winnerExists) {
      return res.status(400).json({ error: 'Winner not in match' });
    }

    // Add vote
    match.votes.push({
      voterId: user._id,
      winnerId
    });

    // Check if majority has voted
    const winnerVotes = match.votes.filter(v => v.winnerId.toString() === winnerId).length;
    const requiredVotes = Math.ceil(match.players.length / 2);

    if (winnerVotes >= requiredVotes) {
      // Award prize to winner
      const winner = await User.findById(winnerId);
      if (winner) {
        winner.coins += match.prizePool;
        await winner.save();

        // Create transaction
        const transaction = new Transaction({
          type: 'match_prize',
          amount: match.prizePool,
          from: null,
          to: winner._id,
          description: `Prize from match: ${match.title}`
        });
        await transaction.save();

        // Update match status
        match.status = 'completed';
        match.winnerId = winner._id;
      }
    }

    await match.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error voting for winner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
