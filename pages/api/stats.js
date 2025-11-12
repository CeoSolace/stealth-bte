import { connectToDatabase } from '../../lib/mongodb';
import { User } from '../../models/User';
import { Match } from '../../models/Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const totalCoins = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]).then(result => result[0]?.total || 0);

    const activeMatches = await Match.countDocuments({ status: 'active' });
    const totalMatches = await Match.countDocuments();

    res.status(200).json({
      totalUsers,
      totalCoins,
      activeMatches,
      totalMatches
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
