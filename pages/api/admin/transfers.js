import { connectToDatabase } from '../../../lib/mongodb';
import { Transaction } from '../../../models/Transaction';
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

    const transactions = await Transaction.find()
      .populate('from', 'username avatar')
      .populate('to', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    const formattedTransactions = transactions.map(tx => ({
      ...tx.toObject(),
      fromUser: tx.from,
      toUser: tx.to
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
