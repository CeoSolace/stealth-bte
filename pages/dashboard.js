import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CoinDisplay from '../components/CoinDisplay';

export default function Dashboard() {
  const {  session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/user');
          const data = await res.json();
          setUserData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [status]);

  useEffect(() => {
    const fetchRecentMatches = async () => {
      try {
        const res = await fetch('/api/matches/recent');
        const data = await res.json();
        setRecentMatches(data);
      } catch (error) {
        console.error('Error fetching recent matches:', error);
      }
    };
    fetchRecentMatches();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome back, {session.user.name}!</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
              />
              <div>
                <p className="text-lg font-semibold">{session.user.name}</p>
                <p className="text-gray-400">Member since {new Date(userData?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <CoinDisplay className="text-2xl" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-2">{userData?.coins || 0}</div>
            <div className="text-gray-400">Total Coins</div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">{userData?.wins || 0}</div>
            <div className="text-gray-400">Total Wins</div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-2">{userData?.losses || 0}</div>
            <div className="text-gray-400">Total Losses</div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{userData?.matchesPlayed || 0}</div>
            <div className="text-gray-400">Matches Played</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/matches/create" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
                <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span>Create Match</span>
              </Link>
              <Link href="/matches" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
                <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span>Join Match</span>
              </Link>
              <Link href="/shop" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
                <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span>Buy Coins</span>
              </Link>
              <Link href="/friends" className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105">
                <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <span>Friends</span>
              </Link>
            </div>
          </div>

          {/* Recent Matches */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Recent Matches</h3>
            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map(match => (
                  <div key={match._id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold truncate">{match.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        match.status === 'active' ? 'bg-green-600' :
                        match.status === 'completed' ? 'bg-blue-600' :
                        'bg-yellow-600'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Players: {match.players.length}/{match.maxPlayers}</span>
                      <span>Prize: {match.prizePool} coins</span>
                    </div>
                    <Link href={`/matches/${match._id}`} className="block mt-2 text-blue-400 hover:text-blue-300 text-sm">
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recent matches</p>
            )}
          </div>
        </div>

        {/* Leaderboards Preview */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Top Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-400">Most Wins</h4>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs mr-2">
                        {i + 1}
                      </span>
                      <span className="text-sm">Player {i + 1}</span>
                    </div>
                    <span className="text-sm font-semibold">{10 - i * 2} wins</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-400">Richest Players</h4>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs mr-2">
                        {i + 1}
                      </span>
                      <span className="text-sm">Player {i + 1}</span>
                    </div>
                    <span className="text-sm font-semibold">{1000 - i * 100} coins</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-purple-400">Most Active</h4>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs mr-2">
                        {i + 1}
                      </span>
                      <span className="text-sm">Player {i + 1}</span>
                    </div>
                    <span className="text-sm font-semibold">{50 - i * 5} matches</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
