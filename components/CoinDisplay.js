import { useSession } from 'next-auth/data';
import { useState, useEffect } from 'react';

export default function CoinDisplay({ className }) {
  const { data: session } = useSession();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const fetchCoins = async () => {
      if (session) {
        try {
          const res = await fetch('/api/user');
          const data = await res.json();
          setCoins(data.coins || 0);
        } catch (error) {
          console.error('Error fetching coins:', error);
        }
      }
    };
    fetchCoins();
  }, [session]);

  return (
    <div className={`flex items-center ${className}`}>
      <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
      </svg>
      <span className="font-bold text-yellow-400">{coins}</span>
      <span className="ml-1 text-sm text-gray-400">coins</span>
    </div>
  );
}
