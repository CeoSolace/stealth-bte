import { connectToDatabase } from '../../../lib/mongodb';
import { Ban } from '../../../models/Ban';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const bans = await Ban.find()
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(bans);
  } catch (error) {
    console.error('Error fetching bans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
