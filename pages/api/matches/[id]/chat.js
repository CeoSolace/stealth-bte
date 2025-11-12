import { connectToDatabase } from '../../../../lib/mongodb';
import { ChatMessage } from '../../../../models/ChatMessage';
import { User } from '../../../../models/User';
import { Match } from '../../../../models/Match';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;
    
    // Verify match exists
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const messages = await ChatMessage.find({ matchId: id })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      sender: {
        username: msg.senderId.username,
        avatar: msg.senderId.avatar
      },
      createdAt: msg.createdAt
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
