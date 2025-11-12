import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Chat from '../../components/Chat';

export default function MatchDetail() {
  const {  session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userJoined, setUserJoined] = useState(false);
  const [userCanVote, setUserCanVote] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/matches/${id}`);
          const data = await res.json();
          setMatch(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching match:', error);
          setLoading(false);
        }
      }
    };
    fetchMatch();
  }, [id]);

  useEffect(() => {
    if (match && session) {
      const joined = match.players.some(p => p.userId === session.user.id);
      setUserJoined(joined);
      
      // Check if user can vote (participated in match and match is completed)
      if (match.status === 'completed' && joined) {
        const voted = match.votes.some(v => v.voterId === session.user.id);
        setUserCanVote(!voted);
      }
    }
  }, [match, session]);

  const joinMatch = async () => {
    try {
      const response = await fetch('/api/matches/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: id }),
      });

      if (response.ok) {
        router.reload();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error joining match:', error);
    }
  };

  const voteWinner = async (winnerId) => {
    try {
      const response = await fetch('/api/matches/vote-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: id, winnerId }),
      });

      if (response.ok) {
        router.reload();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const reportCheater = async (cheaterId) => {
    try {
      const response = await fetch('/api/matches/report-cheater', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: id, cheaterId }),
      });

      if (response.ok) {
        alert('Cheater reported successfully');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error reporting cheater:', error);
    }
  };

  const generateInviteCode = async () => {
    try {
      const response = await fetch(`/api/matches/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setInviteCode(data.inviteCode);
        setShowInviteModal(true);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error generating invite:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading match...</p>
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

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Match Not Found</h1>
          <Link href="/matches" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300">
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/matches" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">{match.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              match.status === 'active' ? 'bg-green-600' :
              match.status === 'completed' ? 'bg-blue-600' :
              'bg-yellow-600'
            }`}>
              {match.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match Info */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-300 mb-4">{match.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Entry Fee</p>
                  <p className="font-bold">{match.entryFee} coins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Prize Pool</p>
                  <p className="font-bold text-green-400">{match.prizePool} coins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <p className="font-bold">{match.players.length}/{match.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-bold">{match.isTournament ? 'Tournament' : 'Match'}</p>
                </div>
              </div>

              {!userJoined && match.status === 'active' && (
                <button
                  onClick={joinMatch}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Join Match
                </button>
              )}

              {userJoined && match.status === 'active' && (
                <button
                  disabled
                  className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed opacity-50"
                >
                  Joined
                </button>
              )}
            </div>

            {/* Players List */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Players ({match.players.length}/{match.maxPlayers})</h2>
                <button
                  onClick={generateInviteCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Invite Players
                </button>
              </div>
              
              <div className="space-y-3">
                {match.players.map(player => (
                  <div key={player.userId} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <img 
                        src={player.avatar} 
                        alt={player.username} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <span className="font-semibold">{player.username}</span>
                        {player.userId === session.user.id && (
                          <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">You</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => reportCheater(player.userId)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voting Section */}
            {match.status === 'completed' && userCanVote && (
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Vote for Winner</h2>
                <div className="space-y-3">
                  {match.players.map(player => (
                    <button
                      key={player.userId}
                      onClick={() => voteWinner(player.userId)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Vote for {player.username}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {match.status === 'completed' && match.winner && (
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Match Results</h2>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">Winner: {match.winner.username}</h3>
                  <p className="text-gray-300">Received {match.prizePool} coins</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Chat matchId={id} />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Invite Players</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">{inviteCode}</p>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Share this code with friends to invite them to this match.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(inviteCode)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Copy Code
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
