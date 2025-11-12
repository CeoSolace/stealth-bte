import { connectToDatabase } from '../../../lib/mongodb';
import { CreatorCode } from '../../../models/CreatorCode';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const codes = await CreatorCode.find()
        .populate('creatorId', 'username avatar')
        .sort({ createdAt: -1 });

      res.status(200).json(codes);
    } catch (error) {
      console.error('Error fetching creator codes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      await connectToDatabase();
      
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { code, creatorId } = req.body;

      // Verify admin key
      if (req.body.adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Invalid admin key' });
      }

      // Check if code already exists
      const existingCode = await CreatorCode.findOne({ code });
      if (existingCode) {
        return res.status(400).json({ error: 'Code already exists' });
      }

      // Check if creator exists
      const creator = await User.findById(creatorId);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      const newCode = new CreatorCode({
        code,
        creatorId
      });
      await newCode.save();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error creating creator code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
