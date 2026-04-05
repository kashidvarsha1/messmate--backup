import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import ImageGallery from '../components/provider/ImageGallery';
import HygieneProofUpload from '../components/provider/HygieneProofUpload';
import MenuManager from '../components/provider/MenuManager';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', reason: '' });
  const [selectedTab, setSelectedTab] = useState('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hygieneProofs, setHygieneProofs] = useState({});
  const [reports, setReports] = useState({});
  const [createForm, setCreateForm] = useState({
    name: '', description: '', pricePerMeal: '', city: '',
    street: '', state: 'Maharashtra', pincode: '',
    mealTypes: [], cuisineType: [], isVegetarian: true
  });

  useEffect(() => {
    fetchMyProviders();
  }, []);

  useEffect(() => {
    if ((selectedTab === 'hygiene' || selectedTab === 'gallery') && providers.length > 0) {
      providers.forEach((provider) => {
        fetchHygieneProofs(provider._id);
      });
    }
  }, [selectedTab, providers]);

  useEffect(() => {
    if (selectedTab === 'reports' && providers.length > 0) {
      providers.forEach((provider) => {
        fetchProvidersReports(provider._id);
      });
    }
  }, [selectedTab, providers]);

  const fetchMyProviders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/providers');
      const myProviders = response.data.data.filter(p =>
        p.ownerId?._id === user?.id || p.ownerId?.id === user?.id
      );
      setProviders(myProviders);
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchHygieneProofs = async (providerId) => {
    if (!providerId) return;
    try {
      const response = await axios.get(`/hygiene/mess/${providerId}`);
      const proofs = response.data.data || [];
      setHygieneProofs(prev => ({ ...prev, [providerId]: proofs }));
    } catch (error) {
      console.error('Error fetching proofs:', error);
      setHygieneProofs(prev => ({ ...prev, [providerId]: [] }));
    }
  };

  const fetchProvidersReports = async (providerId) => {
    if (!providerId) return;
    try {
      const response = await axios.get(`/report/provider/${providerId}`);
      const providerReports = response.data.data || [];
      setReports(prev => ({ ...prev, [providerId]: providerReports }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(prev => ({ ...prev, [providerId]: [] }));
    }
  };

  const handleProofUploaded = (providerId, proof) => {
    if (!providerId || !proof) {
      return;
    }

    setHygieneProofs(prev => {
      const currentProofs = prev[providerId] || [];
      const proofId = proof._id || `${proof.imageUrl}-${proof.createdAt}`;
      const alreadyExists = currentProofs.some(existing => {
        const existingId = existing._id || `${existing.imageUrl}-${existing.createdAt}`;
        return existingId === proofId;
      });

      if (alreadyExists) {
        return prev;
      }

      return {
        ...prev,
        [providerId]: [proof, ...currentProofs],
      };
    });
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.pricePerMeal || !createForm.city || !createForm.street || !createForm.pincode) {
      toast.error('Sab fields zaroori hain!');
      return;
    }
    if (createForm.mealTypes.length === 0) {
      toast.error('Kam se kam ek meal type select karo');
      return;
    }
    if (createForm.cuisineType.length === 0) {
      toast.error('Kam se kam ek cuisine type select karo');
      return;
    }
    try {
      await axios.post('/providers', {
        name: createForm.name,
        providerType: 'mess',
        description: createForm.description,
        address: {
          street: createForm.street,
          city: createForm.city,
          state: createForm.state,
          pincode: createForm.pincode,
          coordinates: { type: 'Point', coordinates: [73.8567, 18.5204] }
        },
        pricePerMeal: parseInt(createForm.pricePerMeal),
        mealTypes: createForm.mealTypes,
        cuisineType: createForm.cuisineType,
        isVegetarian: createForm.isVegetarian
      });
      toast.success('Mess create ho gaya! 🎉');
      setShowCreateForm(false);
      setCreateForm({ name: '', description: '', pricePerMeal: '', city: '', street: '', state: 'Maharashtra', pincode: '', mealTypes: [], cuisineType: [], isVegetarian: true });
      fetchMyProviders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating mess');
      console.error('Creation error:', error.response?.data);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setUpdating(true);
    try {
      await axios.put('/providers/' + selectedProvider._id + '/status', {
        status: statusForm.status, reason: statusForm.reason
      });
      toast.success('Status update ho gaya!');
      fetchMyProviders();
      setSelectedProvider(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const toggleMealType = (type) => {
    setCreateForm(prev => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(type)
        ? prev.mealTypes.filter(t => t !== type)
        : [...prev.mealTypes, type]
    }));
  };

  const toggleCuisineType = (type) => {
    setCreateForm(prev => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(type)
        ? prev.cuisineType.filter(t => t !== type)
        : [...prev.cuisineType, type]
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 border border-amber-100 shadow-sm">
          <h1 className="font-display font-bold text-2xl text-gray-800">Namaste, {user?.name}! 👋</h1>
          <p className="text-gray-400 text-sm">Aapka mess manage karo</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {[
            { key: 'list', label: 'Meri Messes', icon: '🍱', count: providers.length },
            { key: 'menu', label: 'Menu', icon: '🍽️' },
            { key: 'hygiene', label: 'Hygiene Proof', icon: '📸' },
            { key: 'gallery', label: 'My Photos', icon: '🖼️' },
            { key: 'reports', label: 'Complaints', icon: '🚨' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === tab.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}{tab.count !== undefined ? ' (' + tab.count + ')' : ''}</span>
            </button>
          ))}
        </div>

        {/* My Messes Tab */}
        {selectedTab === 'list' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              + Naya Mess Add Karo
            </button>

            {showCreateForm && (
              <div className="bg-white rounded-3xl p-6 border border-amber-100">
                <h3 className="font-bold text-xl mb-4">Naya Mess Register Karo</h3>
                <form onSubmit={handleCreateProvider} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Mess Name *" 
                    value={createForm.name} 
                    onChange={e => setCreateForm({...createForm, name: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    required 
                  />
                  <input 
                    type="number" 
                    placeholder="Price per Meal (₹) *" 
                    value={createForm.pricePerMeal} 
                    onChange={e => setCreateForm({...createForm, pricePerMeal: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    min="10"
                    max="500"
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="City *" 
                    value={createForm.city} 
                    onChange={e => setCreateForm({...createForm, city: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Street/Area *" 
                    value={createForm.street} 
                    onChange={e => setCreateForm({...createForm, street: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Pincode (6 digits) *" 
                    value={createForm.pincode} 
                    onChange={e => setCreateForm({...createForm, pincode: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    pattern="[0-9]{6}"
                    required 
                  />
                  <select 
                    value={createForm.state} 
                    onChange={e => setCreateForm({...createForm, state: e.target.value})} 
                    className="w-full p-2 border rounded-lg"
                  >
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Delhi</option>
                    <option>Uttar Pradesh</option>
                    <option>Rajasthan</option>
                    <option>Other</option>
                  </select>
                  <textarea 
                    placeholder="Description (optional)" 
                    value={createForm.description} 
                    onChange={e => setCreateForm({...createForm, description: e.target.value})} 
                    className="w-full p-2 border rounded-lg" 
                    rows="2"
                  />
                  <div>
                    <label className="font-semibold text-sm">Meal Types:</label>
                    <div className="flex gap-2 mt-2">
                      {['breakfast', 'lunch', 'dinner', 'tiffin'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={createForm.mealTypes.includes(type)} 
                            onChange={() => toggleMealType(type)}
                          />
                          <span className="capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-sm">Cuisine Types:</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Multi-cuisine'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={createForm.cuisineType.includes(type)} 
                            onChange={() => toggleCuisineType(type)}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={createForm.isVegetarian} 
                      onChange={e => setCreateForm({...createForm, isVegetarian: e.target.checked})}
                    />
                    <span>Pure Vegetarian</span>
                  </label>
                  <button 
                    type="submit" 
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
                  >
                    Create Mess
                  </button>
                </form>
              </div>
            )}

            {providers.map(provider => (
              <div key={provider._id} className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
                <h2 className="font-bold text-xl">{provider.name}</h2>
                <p className="text-gray-500">₹{provider.pricePerMeal} per meal</p>
                <button
                  onClick={() => { setSelectedProvider(provider); setStatusForm({ status: provider.status, reason: provider.reason || '' }); }}
                  className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg"
                >
                  Update Status
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Menu Tab */}
        {selectedTab === 'menu' && (
          <div>
            {providers.map(provider => (
              <MenuManager key={provider._id} provider={provider} onUpdate={fetchMyProviders} />
            ))}
          </div>
        )}

        {/* Hygiene Tab */}
        {selectedTab === 'hygiene' && (
          <div>
            {providers.map(provider => {
              const proofs = hygieneProofs[provider._id] || [];
              return (
                <div key={provider._id} className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">{provider.name}</h3>
                  <HygieneProofUpload
                    providerId={provider._id}
                    onUpload={(proof) => handleProofUploaded(provider._id, proof)}
                  />
                  <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-700">
                      {proofs.length > 0
                        ? `${proofs.length} proof photos uploaded`
                        : 'Upload your first hygiene photo'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      All uploaded photos will appear in the `My Photos` tab automatically.
                    </p>
                    {proofs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTab('gallery')}
                        className="mt-3 inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        View My Photos
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gallery Tab */}
        {selectedTab === 'gallery' && (
          <div>
            {providers.map(provider => (
              <ImageGallery
                key={provider._id}
                providerId={provider._id}
                extraImages={hygieneProofs[provider._id] || []}
                refreshKey={(hygieneProofs[provider._id] || []).length}
              />
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            {providers.map(provider => {
              const providerReports = reports[provider._id] || [];
              return (
                <div key={provider._id} className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">{provider.name}</h3>
                  
                  {providerReports.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">✅ Koi complaints nahi!</p>
                      <p className="text-gray-400 text-sm mt-2">Aapke customers satisfied hain</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providerReports.map(report => (
                        <div key={report._id} className="border rounded-2xl p-4 border-amber-100 bg-amber-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">{report.title}</h4>
                              <p className="text-sm text-gray-600">By: {report.userId?.name || 'Anonymous'}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                                report.status === 'verified' ? 'bg-green-100 text-green-800' :
                                report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {report.status === 'pending' ? '⏳ Pending' :
                                 report.status === 'investigating' ? '🔍 Investigating' :
                                 report.status === 'verified' ? '✅ Verified' :
                                 report.status === 'dismissed' ? '✗ Dismissed' :
                                 '✔ Resolved'}
                              </span>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(report.createdAt).toLocaleDateString('hi-IN')}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                          
                          <div className="flex gap-4 text-xs text-gray-600 mb-2">
                            <span>Category: <strong>{report.category}</strong></span>
                            <span>Severity: <strong className={
                              report.severity === 'high' ? 'text-red-600' :
                              report.severity === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }>{report.severity}</strong></span>
                          </div>

                          {report.evidence && report.evidence.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-amber-100">
                              <p className="text-xs font-semibold text-gray-600 mb-2">📸 Evidence:</p>
                              <div className="flex gap-2 flex-wrap">
                                {report.evidence.map((img, idx) => (
                                  <a
                                    key={idx}
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                  >
                                    <img
                                      src={img}
                                      alt={`Evidence ${idx + 1}`}
                                      className="h-16 w-16 rounded-lg object-cover border border-amber-100 hover:opacity-80 cursor-pointer"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {report.adminNote && (
                            <div className="mt-3 pt-3 border-t border-amber-100 bg-blue-50 p-2 rounded-lg">
                              <p className="text-xs font-semibold text-blue-700">Admin Note:</p>
                              <p className="text-xs text-blue-600">{report.adminNote}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-600">
                      <strong>💡 Note:</strong> {providerReports.length} complaint{providerReports.length !== 1 ? 's' : ''} registered. Sab auto-verify ho gaye. Admin 24 ghante mein action le sakta hai.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <h3 className="font-bold text-xl mb-4">Update Status: {selectedProvider.name}</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <select value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="limited">Limited</option>
                <option value="unknown">Unknown</option>
              </select>
              <input type="text" placeholder="Reason (optional)" value={statusForm.reason} onChange={e => setStatusForm({...statusForm, reason: e.target.value})} className="w-full p-2 border rounded-lg" />
              <button type="submit" disabled={updating} className="w-full bg-orange-500 text-white py-2 rounded-lg">
                {updating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => setSelectedProvider(null)} className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
