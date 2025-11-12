import { useSession } from 'next-auth/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Leaderboard() {
  const {  session, status } = useSession();
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await fetch('/api/leaderboard/richest');
        const data = await res.json();
        setTopUsers(data.slice(0, 10));
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchTopUsers();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top players in the community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Richest Players</h2>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-600' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-800' :
                      'bg-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="font-semibold">{user.username}</span>
                  </div>
                  <span className="font-bold text-yellow-400">{user.coins} coins</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Leaderboard Types</h2>
            <div className="space-y-3">
              <Link href="/leaderboard/richest" className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
                Richest Players
              </Link>
              <Link href="/leaderboard/most-wins" className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
                Most Wins
              </Link>
              <Link href="/leaderboard/most-active" className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
                Most Active
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
