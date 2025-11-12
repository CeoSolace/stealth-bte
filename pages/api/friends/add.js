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

    const { username } = req.body;

    const currentUser = await User.findOne({ discordId: session.user.id });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friend = await User.findOne({ username });
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    if (friend._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    if (currentUser.friends.includes(friend._id)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    currentUser.friends.push(friend._id);
    await currentUser.save();

    // Also add current user to friend's friends list (bidirectional)
    friend.friends.push(currentUser._id);
    await friend.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
