import { useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email daalo');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      if (response.data.success) {
        toast.success(response.data.message || 'OTP email par bhej diya gaya');
        if (response.data.otp) {
          toast(`Dev OTP: ${response.data.otp}`, { duration: 10000 });
        }
        setStep(2);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kuch gadbad hui');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Password match nahi kar rahe');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password kam se kam 8 characters ka ho');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      if (response.data.success) {
        toast.success('Password change ho gaya! Ab login karo');
        setStep(3);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP galat hai ya expire ho gaya');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Password Reset Ho Gaya!</h2>
          <p className="text-gray-600 mb-6">Ab naye password se login karo</p>
          <Link to="/login" className="btn-primary inline-block">
            Login Page Pe Jao
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? 'Apna email daalo, OTP bhejenge' : 'OTP daalo aur naya password banao'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {loading ? 'Bhej rahe...' : 'Send OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="6 digit OTP"
                maxLength={6}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Naya Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Phir se likho"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {loading ? 'Reset ho raha...' : 'Reset Password →'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-orange-500 hover:underline">
            ← Wapas Login pe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
