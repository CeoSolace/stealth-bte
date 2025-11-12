import { useSession } from 'next-auth/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CoinDisplay from '../components/CoinDisplay';

export default function Withdraw() {
  const {  session, status } = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (session) {
        try {
          const res = await fetch('/api/user');
          const data = await res.json();
          setUserCoins(data.coins || 0);
        } catch (error) {
          console.error('Error fetching user coins:', error);
        }
      }
    };
    fetchUserCoins();
  }, [session]);

  const handleWithdraw = async () => {
    if (!session) {
      alert('Please login first');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amountNum > userCoins) {
      alert('Insufficient coins');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountNum }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Successfully withdrew ${result.amount} coins!`);
        setAmount('');
        // Refresh user coins
        const res = await fetch('/api/user');
        const data = await res.json();
        setUserCoins(data.coins || 0);
      } else {
        alert(result.message || 'Error withdrawing coins');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300">
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const fee = amount ? Math.floor(parseInt(amount) * 0.03) : 0;
  const netAmount = amount ? parseInt(amount) - fee : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Withdraw Coins</h1>
          </div>

          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">Your Balance</div>
            <div className="text-2xl font-bold text-yellow-400">{userCoins} coins</div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={userCoins}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Withdrawal Amount:</span>
              <span className="font-bold">{amount || 0} coins</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Withdrawal Fee (3%):</span>
              <span className="font-bold text-red-400">
                {fee} coins
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
              <span>You Receive:</span>
              <span className="font-bold text-green-400 text-xl">
                {netAmount} coins
              </span>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseInt(amount) > userCoins || parseInt(amount) <= 0}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Processing...' : 'Withdraw Coins'}
          </button>

          <div className="mt-6 text-sm text-gray-400">
            <h4 className="font-bold mb-2">Withdrawal Information:</h4>
            <ul className="space-y-1">
              <li>• 3% of withdrawal amount goes to system revenue</li>
              <li>• Minimum withdrawal is 1 coin</li>
              <li>• Withdrawals are processed immediately</li>
              <li>• Cannot be reversed once processed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
