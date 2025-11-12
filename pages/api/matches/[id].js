import { connectToDatabase } from '../../../lib/mongodb';
import { Match } from '../../../models/Match';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      await connectToDatabase();

      const match = await Match.findById(id).populate('players.userId', 'username avatar coins');
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Format players data
      const players = match.players.map(player => ({
        userId: player.userId._id,
        username: player.userId.username,
        avatar: player.userId.avatar,
        coins: player.userId.coins
      }));

      res.status(200).json({
        ...match.toObject(),
        players
      });
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
