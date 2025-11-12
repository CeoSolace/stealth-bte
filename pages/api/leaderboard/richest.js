import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const users = await User.find({ coins: { $gt: 0 } })
      .select('username avatar coins')
      .sort({ coins: -1 })
      .limit(100);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching richest leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
