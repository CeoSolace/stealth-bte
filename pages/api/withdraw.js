import { connectToDatabase } from '../../lib/mongodb';
import { User } from '../../models/User';
import { Transaction } from '../../models/Transaction';

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

    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findOne({ discordId: session.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate withdrawal fee (3%)
    const fee = Math.floor(amount * 0.03);
    const netAmount = amount - fee;
    
    if (user.coins < amount) {
      return res.status(400).json({ error: `Insufficient coins. You have ${user.coins} coins, need ${amount} coins.` });
    }

    // Deduct coins from user
    user.coins -= amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      type: 'withdrawal',
      amount: amount,
      from: user._id,
      to: null,
      description: `Withdrawal of ${amount} coins`,
      fee: fee
    });
    await transaction.save();

    res.status(200).json({
      success: true,
      amount: netAmount,
      fee: fee,
      message: `Successfully withdrew ${netAmount} coins (3% fee applied)`
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
