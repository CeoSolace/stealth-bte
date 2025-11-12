import { connectToDatabase } from '../../../lib/mongodb';
import { User } from '../../../models/User';
import { Ban } from '../../../models/Ban';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { userId, action, reason, duration, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Invalid admin key' });
    }

    if (action === 'ban') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate ban duration
      let expires = null;
      if (duration) {
        expires = new Date(Date.now() + duration);
      }

      const ban = new Ban({
        userId,
        reason,
        expires,
        adminId: session.user.id
      });
      await ban.save();

      // Update user's ban status
      user.isBanned = true;
      user.banExpires = expires;
      await user.save();

      res.status(200).json({ success: true });
    } else if (action === 'unban') {
      await Ban.updateMany(
        { userId, expires: { $gt: new Date() } },
        { expires: new Date() }
      );

      const user = await User.findById(userId);
      if (user) {
        user.isBanned = false;
        user.banExpires = null;
        await user.save();
      }

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error managing ban:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
