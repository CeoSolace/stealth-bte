import { connectToDatabase } from '../../../lib/mongodb';
import { Match } from '../../../models/Match';
import { ChatMessage } from '../../../models/ChatMessage';
import { User } from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      
      const { matchId } = req.query;
      const messages = await ChatMessage.find({ matchId })
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
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      await connectToDatabase();
      
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { matchId, message, senderId } = req.body;

      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Check if user is in match
      const userInMatch = match.players.some(p => p.userId.toString() === senderId);
      if (!userInMatch) {
        return res.status(400).json({ error: 'User not in match' });
      }

      const user = await User.findById(senderId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const chatMessage = new ChatMessage({
        matchId,
        content: message,
        senderId: senderId
      });
      await chatMessage.save();

      res.status(201).json({
        _id: chatMessage._id,
        content: chatMessage.content,
        sender: {
          username: user.username,
          avatar: user.avatar
        },
        createdAt: chatMessage.createdAt
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
