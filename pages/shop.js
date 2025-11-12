import { useSession } from 'next-auth/data';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Shop() {
  const {  session, status } = useSession();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [creatorCode, setCreatorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatePrice = (amount) => {
    if (amount >= 1000) {
      return (amount * 0.20).toFixed(2);
    } else {
      return (amount * 1.00).toFixed(2);
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      alert('Please login first');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coins: selectedAmount,
          creatorCode: creatorCode || null,
        }),
      });

      const session = await response.json();

      if (response.ok) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (error) {
          console.error('Stripe error:', error);
        }
      } else {
        alert(session.error || 'Error creating checkout session');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Coin Shop</h1>
          <p className="text-gray-400">Purchase coins with volume discounts</p>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { amount: 100, price: 100, discount: 0 },
            { amount: 500, price: 500, discount: 0 },
            { amount: 1000, price: 200, discount: 80 }, // 80% discount
            { amount: 5000, price: 1000, discount: 80 }, // 80% discount
            { amount: 10000, price: 2000, discount: 80 }, // 80% discount
            { amount: 25000, price: 5000, discount: 80 } // 80% discount
          ].map((pkg, index) => (
            <div 
              key={index}
              className={`bg-gray-800/50 p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                selectedAmount === pkg.amount 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedAmount(pkg.amount)}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{pkg.amount}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{pkg.amount} Coins</h3>
                <p className="text-2xl font-bold text-green-400 mb-2">£{pkg.price}</p>
                {pkg.discount > 0 && (
                  <p className="text-sm text-yellow-400">Save {pkg.discount}%!</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Form */}
        <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Creator Code (optional)</label>
            <input
              type="text"
              value={creatorCode}
              onChange={(e) => setCreatorCode(e.target.value)}
              placeholder="Enter creator code"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Selected Amount:</span>
              <span className="font-bold">{selectedAmount} coins</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Base Price:</span>
              <span className="font-bold">£{calculatePrice(selectedAmount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Creator Bonus Fee:</span>
              <span className="font-bold">£0.99</span>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-400 text-xl">
                £{(parseFloat(calculatePrice(selectedAmount)) + 0.99).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Processing...' : 'Purchase Coins'}
          </button>

          {/* Pricing Info */}
          <div className="mt-6 text-sm text-gray-400">
            <h4 className="font-bold mb-2">Pricing Information:</h4>
            <ul className="space-y-1">
              <li>• 1-999 coins: £1.00 per coin</li>
              <li>• 1000+ coins: £0.20 per coin (80% discount!)</li>
              <li>• A £0.99 fee is added to all purchases to cover creator bonuses</li>
              <li>• Coins are delivered immediately after payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
