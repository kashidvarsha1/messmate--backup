import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords match nahi kar rahe'); return; }
    if (formData.password.length < 8) { toast.error('Password kam se kam 8 characters ka hona chahiye'); return; }
    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    if (result.success) {
      toast.success('Account ban gaya! Welcome to MessMate');
      navigate(result.user?.role === 'owner' ? '/dashboard' : '/');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🍱</span>
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-2xl text-gray-800">MessMate</div>
              <div className="text-xs text-gray-400">Ghar jaisa khana</div>
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800">Naya Account Banao</h2>
          <p className="text-gray-500 mt-1 text-sm">MessMate family mein swagat hai!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-100">
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-gray-50 rounded-2xl">
            <button type="button" onClick={() => setFormData({...formData, role: 'customer'})}
              className={'py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ' + (formData.role === 'customer' ? 'bg-white shadow-md text-orange-600 border border-amber-100' : 'text-gray-500')}>
              <span>🍽️</span><span>Khana Khana Hai</span>
            </button>
            <button type="button" onClick={() => setFormData({...formData, role: 'owner'})}
              className={'py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ' + (formData.role === 'owner' ? 'bg-white shadow-md text-green-600 border border-green-100' : 'text-gray-500')}>
              <span>🏠</span><span>Mess Listed Karna Hai</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pura Naam</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Jaise: Ramesh Kumar" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="aapka@email.com" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-12" placeholder="10 digit number" required disabled={loading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field pr-12" placeholder="Kam se kam 8 characters" required disabled={loading} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Confirm Karo</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="Wahi password dobara" required disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 mt-2">
              {loading ? <><span>⏳</span><span>Account ban raha hai...</span></> : <><span>Account Banao</span><span>→</span></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">pehle se account hai?</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <Link to="/login" className="w-full btn-secondary py-3 text-base flex items-center justify-center gap-2">
            <span>Login Karo</span>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <span>🔒</span><span>Aapka data safe hai. Hum kabhi share nahi karte.</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
