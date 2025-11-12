import { connectToDatabase } from '../../../lib/mongodb';
import { Match } from '../../../models/Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const matches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
