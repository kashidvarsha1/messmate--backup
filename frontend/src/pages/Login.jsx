import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = location.state?.from?.pathname || (user.role === 'owner' ? '/dashboard' : '/');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user]);

  const getDefaultRoute = (role) => {
    if (role === 'owner') return '/dashboard';
    if (role === 'admin') return '/admin';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back! 🍱');
        const dest = location.state?.from?.pathname || getDefaultRoute(result.user?.role);
        navigate(dest, { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warm-400 to-spice-500 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🍱</span>
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-2xl text-gray-800">Mess<span className="text-spice-500">Mate</span></div>
              <div className="text-xs text-gray-400">Ghar jaisa khana</div>
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800">Wapas aaye! 👋</h2>
          <p className="text-gray-500 mt-1 text-sm">Apne account mein login karo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email ya Phone</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="example@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Apna password dalو"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base justify-center flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Login ho raha hai...</span>
                </>
              ) : (
                <>
                  <span>Login Karo</span>
                  <span>→</span>
                </>
              )}
            </button>
          
            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
</form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400 font-medium">naya ho?</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <Link
            to="/register"
            className="w-full btn-secondary py-3 text-base flex items-center justify-center gap-2"
          >
            <span>🆕</span>
            <span>Naya Account Banao</span>
          </Link>
        </div>

        {/* Trust note */}
        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>Aapka data safe hai. Hum kabhi share nahi karte.</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
