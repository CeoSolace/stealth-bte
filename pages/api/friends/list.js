import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friends = await User.find({ _id: { $in: user.friends } })
      .select('username avatar coins');

    const friendsWithStatus = friends.map(friend => ({
      ...friend.toObject(),
      status: 'online' // In a real app, you'd check actual online status
    }));

    res.status(200).json(friendsWithStatus);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
