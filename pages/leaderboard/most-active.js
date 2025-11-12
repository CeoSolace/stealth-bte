import { useSession } from 'next-auth/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MostActiveLeaderboard() {
  const {  session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/leaderboard/most-active');
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (status === 'loading' || loading) {
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
        <div className="flex items-center mb-6">
          <Link href="/leaderboard" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">Most Active Players</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-4 px-6 text-left">Rank</th>
                <th className="py-4 px-6 text-left">Player</th>
                <th className="py-4 px-6 text-left">Matches</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id} className={`border-b border-gray-700 hover:bg-gray-700/50 ${index < 3 ? 'bg-purple-900/10' : ''}`}>
                  <td className="py-4 px-6">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-600' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-800' :
                      'bg-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-purple-400">{user.matchesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
