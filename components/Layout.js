import { useSession, signOut } from 'next-auth/data';
import Link from 'next/link';
import CoinDisplay from './CoinDisplay';

export default function Layout({ children }) {
  const {  session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                StealthUnit.gg
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Home
                </Link>
                <Link href="/matches" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Matches
                </Link>
                <Link href="/shop" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Shop
                </Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Leaderboard
                </Link>
                <Link href="/friends" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Friends
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              {status === 'authenticated' ? (
                <>
                  <CoinDisplay className="mr-4" />
                  <div className="relative">
                    <button className="flex items-center text-sm text-white group">
                      <img 
                        src={session.user.image} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full mr-2 border-2 border-gray-600"
                      />
                      <span>{session.user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-300">
                        Dashboard
                      </Link>
                      {session.user.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-300">
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors duration-300"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-800/80 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex space-x-4 overflow-x-auto">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                Home
              </Link>
              <Link href="/matches" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                Matches
              </Link>
              <Link href="/shop" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                Shop
              </Link>
              <Link href="/leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                Leaderboard
              </Link>
              <Link href="/friends" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                Friends
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/80 backdrop-blur-lg border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">StealthUnit.gg</h3>
              <p className="text-gray-400 text-sm">
                Competitive gaming platform with coin system, tournaments, and anti-cheat protection.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/matches" className="hover:text-white transition-colors duration-300">Matches</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors duration-300">Shop</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors duration-300">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/faq" className="hover:text-white transition-colors duration-300">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors duration-300">Support</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors duration-300">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/discord" className="hover:text-white transition-colors duration-300">Discord</Link></li>
                <li><Link href="/twitter" className="hover:text-white transition-colors duration-300">Twitter</Link></li>
                <li><Link href="/github" className="hover:text-white transition-colors duration-300">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 StealthUnit.gg. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
