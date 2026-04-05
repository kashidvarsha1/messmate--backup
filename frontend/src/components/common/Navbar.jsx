import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from './FeedbackModal.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍛</span>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                MessMate
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">Ghar jaisa khana</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/" className="text-gray-600 hover:text-orange-500 transition-colors">
                    🏠 Home
                  </Link>
                  {user?.role === 'owner' && (
                    <Link to="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors">
                      📊 Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-600 hover:text-orange-500 transition-colors">
                    👤 {user?.name?.split(' ')[0] || 'Profile'}
                  </Link>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="text-gray-600 hover:text-orange-500 transition-colors px-3 py-2"
                  >
                    💬 Feedback
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/" className="text-gray-600 hover:text-orange-500 px-2 py-1">
                      🏠 Home
                    </Link>
                    {user?.role === 'owner' && (
                      <Link to="/dashboard" className="text-gray-600 hover:text-orange-500 px-2 py-1">
                        📊 Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="text-gray-600 hover:text-orange-500 px-2 py-1">
                      👤 Profile
                    </Link>
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="text-left text-gray-600 hover:text-orange-500 px-2 py-1"
                    >
                      💬 Feedback
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left text-red-500 hover:text-red-600 px-2 py-1"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-orange-500 px-2 py-1">
                      Login
                    </Link>
                    <Link to="/register" className="text-orange-500 font-medium px-2 py-1">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
};

export default Navbar;