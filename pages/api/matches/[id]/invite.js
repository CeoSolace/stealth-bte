import { connectToDatabase } from '../../../../lib/mongodb';
import { Match } from '../../../../models/Match';

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

    const { matchId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Only creator can generate invite
    if (match.creatorId.toString() !== session.user.id) {
      return res.status(403).json({ error: 'Only match creator can generate invite' });
    }

    // Generate invite code (simple implementation)
    const inviteCode = `MATCH_${matchId.substring(0, 8)}_${Date.now().toString(36)}`;

    res.status(200).json({ inviteCode });
  } catch (error) {
    console.error('Error generating invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
