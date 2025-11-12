import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';
import { Match } from '../../../models/Match';
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

    const { title, description, entryFee, maxPlayers, isTournament } = req.body;

    if (!title || !description || !entryFee || !maxPlayers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (entryFee < 5) {
      return res.status(400).json({ error: 'Minimum entry fee is 5 coins' });
    }

    if (maxPlayers < 2 || maxPlayers > 16) {
      return res.status(400).json({ error: 'Max players must be between 2 and 16' });
    }

    // Find user
    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate entry cost (doubled for tournaments)
    const entryCost = entryFee * (isTournament ? 2 : 1);
    if (user.coins < entryCost) {
      return res.status(400).json({ error: `Insufficient coins. Need ${entryCost} coins to create ${isTournament ? 'tournament' : 'match'}.` });
    }

    // Deduct entry fee from user
    user.coins -= entryCost;
    await user.save();

    // Create transaction for entry fee
    const transaction = new Transaction({
      type: 'match_entry',
      amount: entryCost,
      from: user._id,
      to: null,
      description: `Entry fee for ${isTournament ? 'tournament' : 'match'}: ${title}`
    });
    await transaction.save();

    // Create match
    const match = new Match({
      title,
      description,
      entryFee,
      maxPlayers,
      prizePool: entryFee * maxPlayers * (isTournament ? 2 : 1),
      isTournament,
      creatorId: user._id,
      players: [{
        userId: user._id,
        joinedAt: new Date()
      }]
    });
    await match.save();

    res.status(201).json({ match: match._id });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
