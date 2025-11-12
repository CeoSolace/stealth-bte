import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';

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

    const { friendId } = req.body;

    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'Not friends' });
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    // Also remove from friend's friends list
    await User.updateOne(
      { _id: friendId },
      { $pull: { friends: user._id } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
