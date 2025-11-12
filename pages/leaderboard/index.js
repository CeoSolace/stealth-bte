import { useSession } from 'next-auth/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Leaderboard() {
  const {  session, status } = useSession();
  const [topUsers, setTopUsers] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        // Fetch richest users
        const richRes = await fetch('/api/leaderboard/richest');
        const richData = await richRes.json();
        
        // Fetch most wins
        const winsRes = await fetch('/api/leaderboard/most-wins');
        const winsData = await winsRes.json();
        
        setTopUsers(richData.slice(0, 10));
        setTopWinners(winsData.slice(0, 10));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top players in the community</p>
        </div>

        {/* Leaderboard Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/leaderboard/richest" className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Richest</h3>
            <p className="text-gray-400 text-sm">Most coins</p>
          </Link>
          
          <Link href="/leaderboard/most-wins" className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Most Wins</h3>
            <p className="text-gray-400 text-sm">Most victories</p>
          </Link>
          
          <Link href="/leaderboard/most-active" className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Most Active</h3>
            <p className="text-gray-400 text-sm">Most matches</p>
          </Link>
        </div>

        {/* Top Players */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Richest Players */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Top 10 Richest Players</h2>
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

          {/* Most Wins */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Top 10 Most Wins</h2>
            <div className="space-y-3">
              {topWinners.map((user, index) => (
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
                  <span className="font-bold text-green-400">{user.wins} wins</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
