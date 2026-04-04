import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', profilePicture: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', profilePicture: user.profilePicture || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put('/auth/update-profile', {
        name: form.name, phone: form.phone, profilePicture: form.profilePicture
      });
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile update ho gaya!');
        setForm({ name: updatedUser.name, phone: updatedUser.phone, profilePicture: updatedUser.profilePicture });
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be < 2MB'); return; }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const response = await axios.post('/upload', formData);
      
      // Handle different response formats
      let imageUrl = null;
      if (response.data.url) {
        imageUrl = response.data.url;
      } else if (response.data.data?.url) {
        imageUrl = response.data.data.url;
      } else if (response.data.imageUrl) {
        imageUrl = response.data.imageUrl;
      } else if (typeof response.data === 'string') {
        imageUrl = response.data;
      }
      
      if (imageUrl) {
        setForm(prev => ({ ...prev, profilePicture: imageUrl }));
        toast.success('Photo upload ho gayi! Save karo.');
      } else {
        toast.error('Upload response mein URL nahi mila');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-amber-100 shadow-sm">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl mx-auto overflow-hidden shadow-md">
                {form.profilePicture ? (
                  <img src={form.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-white rounded-xl p-1.5 shadow-md cursor-pointer border border-amber-100">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <span>📷</span>}
              </label>
            </div>
            <h2 className="font-display font-bold text-xl mt-3">{form.name || user.name}</h2>
            <p className="text-gray-400 text-sm capitalize">{user.role}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pura Naam</label>
              <input type="text" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={user.email || ''} disabled className="input-field opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number
                <span className="text-orange-500 ml-1 font-normal text-xs">(WhatsApp ke liye)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
                <input type="tel" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0,10)})}
                  className="input-field pl-12" placeholder="10 digit number" maxLength="10" />
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-700">📱 Phone number customers ko WhatsApp pe contact karne ke liye use hoga</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading ? <><span>⏳</span><span>Save ho raha hai...</span></> : <><span>✅</span><span>Profile Save Karo</span></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
