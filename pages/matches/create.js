import { useSession } from 'next-auth/data';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CreateMatch() {
  const {  session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    entryFee: 10,
    maxPlayers: 2,
    isTournament: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/matches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          entryFee: parseInt(formData.entryFee),
          maxPlayers: parseInt(formData.maxPlayers),
          prizePool: parseInt(formData.entryFee) * parseInt(formData.maxPlayers) * (formData.isTournament ? 2 : 1)
        }),
      });

      if (response.ok) {
        router.push('/matches');
      } else {
        const error = await response.json();
        alert(error.message || 'Error creating match');
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="flex items-center mb-6">
            <Link href="/matches" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Create New Match</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter match title"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your match"
                rows="4"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Entry Fee (coins)</label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  min="5"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Players</label>
                <select
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="2">2 Players</option>
                  <option value="4">4 Players</option>
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                </select>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isTournament"
                  checked={formData.isTournament}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Create as Tournament (Entry fee doubled)</span>
              </label>
            </div>

            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Prize Pool:</span>
                <span className="font-bold text-green-400">
                  {formData.entryFee * formData.maxPlayers * (formData.isTournament ? 2 : 1)} coins
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Your Entry Cost:</span>
                <span className="font-bold">
                  {formData.entryFee * (formData.isTournament ? 2 : 1)} coins
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
