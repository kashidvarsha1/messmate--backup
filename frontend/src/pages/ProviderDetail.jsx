import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import ComplaintHistory from '../components/provider/ComplaintHistory';
import ComplaintManagementPanel from '../components/provider/ComplaintManagementPanel';
import ImageGallery from '../components/provider/ImageGallery';
import HygieneProofUpload from '../components/provider/HygieneProofUpload';
import ReviewCard from '../components/review/ReviewCard';
import toast from 'react-hot-toast';

const ProviderDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [media, setMedia] = useState([]);
  const [hygieneProofs, setHygieneProofs] = useState([]);
  const [complaintSummary, setComplaintSummary] = useState({ total: 0, verified: 0, underReview: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { if (id) fetchProviderData(); }, [id]);
  useEffect(() => { if (id) fetchComplaintSummary(); }, [id]);
  useEffect(() => {
    if (id) {
      fetchHygieneProofs();
    }
  }, [id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const providerRes = await axios.get('/providers/' + id);
      setProvider(providerRes.data.data);
      try { const r = await axios.get('/reviews/provider/' + id); setReviews(r.data.data || []); } catch(e) { setReviews([]); }
      try { const m = await axios.get('/media/provider/' + id); setMedia(m.data.data || []); } catch(e) { setMedia([]); }
    } catch (error) {
      setError(error.response?.data?.message || 'Provider load nahi hua');
      toast.error('Provider details load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const fetchHygieneProofs = async () => {
    try {
      const response = await axios.get('/hygiene/mess/' + id);
      setHygieneProofs(response.data.data || []);
    } catch (error) {
      setHygieneProofs([]);
    }
  };

  const fetchComplaintSummary = async () => {
    try {
      const response = await axios.get('/reports/provider/' + id + '/public');
      setComplaintSummary({
        total: response.data.total || 0,
        verified: response.data.verified || 0,
        underReview: response.data.underReview || 0,
      });
    } catch (error) {
      setComplaintSummary({ total: 0, verified: 0, underReview: 0 });
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'open':    return { icon: '🟢', label: 'Abhi Open Hai', cls: 'bg-green-100 text-green-800 border-green-200' };
      case 'closed':  return { icon: '🔴', label: 'Abhi Band Hai', cls: 'bg-red-100 text-red-800 border-red-200' };
      case 'limited': return { icon: '🟡', label: 'Limited Seats', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default:        return { icon: '⚪', label: 'Status Unknown', cls: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getHygieneInfo = (score) => {
    if (score >= 4.5) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', emoji: '🌟' };
    if (score >= 3.5) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', emoji: '👍' };
    if (score >= 2.5) return { label: 'Average', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', emoji: '⚠️' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', emoji: '❌' };
  };

  if (loading) return <Loader />;

  if (error || !provider) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-display font-bold text-2xl text-gray-700 mb-2">Provider Nahi Mila</h2>
        <p className="text-gray-500 mb-6">{error || 'Yeh provider exist nahi karta.'}</p>
        <Link to="/" className="btn-primary">Wapas Jao</Link>
      </div>
    </div>
  );

  const status = getStatusInfo(provider.status);
  const hygiene = provider.hygieneScore || 0;
  const hInfo = getHygieneInfo(hygiene);
  const isProviderOwner =
    isAuthenticated &&
    isOwner &&
    (provider.ownerId?._id === user?.id || provider.ownerId?.id === user?.id);
  const canViewComplaintManager = isAdmin || isProviderOwner;
  const totalPhotoCount = new Set(
    [...media, ...hygieneProofs]
      .map((item) => item?.url || item?.imageUrl)
      .filter(Boolean)
  ).size;

  const handleProofUploaded = (proof) => {
    if (!proof) {
      return;
    }

    setHygieneProofs(prev => {
      const proofId = proof._id || `${proof.imageUrl}-${proof.createdAt}`;
      const alreadyExists = prev.some(existing => {
        const existingId = existing._id || `${existing.imageUrl}-${existing.createdAt}`;
        return existingId === proofId;
      });

      if (alreadyExists) {
        return prev;
      }

      return [proof, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            ← Wapas
          </button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🍱
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 leading-tight">{provider.name}</h1>
                  <p className="text-gray-400 text-sm mt-1">📍 {provider.address?.street}, {provider.address?.city}, {provider.address?.state}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ' + status.cls}>
                  {status.icon} {status.label}
                </span>
                {provider.isVegetarian && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                    🥬 Pure Veg
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{provider.description}</p>
            </div>
            <div className="flex flex-col gap-3 md:min-w-[200px]">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-orange-500">₹{provider.pricePerMeal}</div>
                <div className="text-xs text-gray-400 mt-0.5">per meal</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold text-gray-700">{provider.averageRating?.toFixed(1) || '—'}</span>
                  <span className="text-gray-400 text-xs">({provider.totalReviews || 0})</span>
                </div>
              </div>
              {provider.ownerId?.phone && (
                <a href={'https://wa.me/91' + provider.ownerId.phone}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all">
                  📱 WhatsApp Karo
                </a>
              )}
              {isAuthenticated && user?.role === 'customer' && (
                <div className="flex flex-col gap-2">
                  <Link to={'/provider/' + id + '/review'} className="btn-primary text-center text-sm py-2.5">✍️ Review Likho</Link>
                  <Link to={'/provider/' + id + '/report'} className="btn-secondary text-center text-sm py-2.5">🚩 Issue Report</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className={'rounded-2xl border-2 p-5 flex items-center gap-5 ' + hInfo.bg + ' ' + hInfo.border}>
          <div className={'text-center min-w-[80px] ' + hInfo.color}>
            <div className="text-4xl font-display font-bold">{hygiene.toFixed(1)}</div>
            <div className="text-sm opacity-60">/ 5.0</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-700">Hygiene Score</span>
              <span className="text-xl">{hInfo.emoji}</span>
            </div>
            <div className={'text-lg font-bold ' + hInfo.color}>{hInfo.label}</div>
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={'h-2 flex-1 rounded-full ' + (s <= Math.round(hygiene) ? 'bg-current opacity-100' : 'bg-current opacity-20') + ' ' + hInfo.color} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm overflow-x-auto">
          {['overview','reviews','photos','insights'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ' +
                (activeTab === tab ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')}>
              {tab === 'overview' && '🏠 Overview'}
              {tab === 'reviews' && '⭐ Reviews (' + reviews.length + ')'}
              {tab === 'photos' && '📸 Photos (' + totalPhotoCount + ')'}
              {tab === 'insights' && '📊 Insights'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {activeTab === 'overview' && (
          <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-3">📍 Location</h3>
              <p className="text-gray-700">{provider.address?.street}</p>
              <p className="text-gray-500 text-sm">{provider.address?.city}, {provider.address?.state} — {provider.address?.pincode}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-3">🍽️ Meal Details</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {provider.mealTypes?.map(t => (
                  <span key={t} className="text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 capitalize">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {provider.cuisineType?.map(c => (
                  <span key={c} className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100 capitalize">{c}</span>
                ))}
              </div>
            </div>

            {provider.menu && provider.menu.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-display font-bold text-lg mb-4">🍱 Menu aur Prices</h3>
                <div className="space-y-3">
                  {['breakfast','lunch','dinner','tiffin','snacks','drinks','other'].map(cat => {
                    const items = provider.menu.filter(i => i.category === cat && i.isAvailable);
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <div className="text-xs font-bold uppercase text-gray-400 mb-2 capitalize">{cat}</div>
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="flex items-center gap-2">
                              <span>{item.isVeg ? '🟢' : '🔴'}</span>
                              <span className="text-gray-700 text-sm">{item.itemName}</span>
                            </span>
                            <span className="font-bold text-orange-500">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <ComplaintHistory providerId={id} />
            <ComplaintManagementPanel
              providerId={id}
              canManage={canViewComplaintManager}
            />
            <ImageGallery
              providerId={id}
              extraImages={hygieneProofs}
              refreshKey={hygieneProofs.length}
            />
            {isAuthenticated && (isOwner || isAdmin) && (
              <div className="space-y-3">
                <HygieneProofUpload providerId={id} onUpload={handleProofUploaded} />
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Uploaded hygiene photos automatically appear in the photo gallery above.
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="text-5xl mb-3">⭐</div>
                <p className="font-semibold text-gray-600">Abhi tak koi review nahi</p>
                {isAuthenticated && user?.role === 'customer' && (
                  <Link to={'/provider/' + id + '/review'} className="btn-primary mt-4 inline-block">Review Likho</Link>
                )}
              </div>
            ) : reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}

        {activeTab === 'photos' && (
          <ImageGallery
            providerId={id}
            extraImages={hygieneProofs}
            refreshKey={hygieneProofs.length}
            title="All Uploaded Photos"
          />
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reviews', value: provider.totalReviews || 0, icon: '⭐' },
              { label: 'Public Reports', value: complaintSummary.total || 0, icon: '🚩' },
              { label: 'Avg Rating', value: (provider.averageRating || 0) + '/5', icon: '📊' },
              { label: 'Trust Score', value: provider.trustScore || 0, icon: '🛡️' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-display font-bold text-2xl text-gray-800">{item.value}</div>
                <div className="text-xs text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetail;
