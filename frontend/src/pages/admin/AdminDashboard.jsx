import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, providersRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/providers'),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setProviders(providersRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin dashboard load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/toggle-status`);
      toast.success('User status updated');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'User update failed');
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm">Loading admin dashboard...</div>;
  }

  const statCards = [
    { label: 'Users', value: stats?.totalUsers || 0, helper: `${stats?.activeUsers || 0} active`, icon: '👥' },
    { label: 'Providers', value: stats?.totalProviders || 0, helper: `${stats?.activeProviders || 0} active`, icon: '🍱' },
    { label: 'Reports', value: stats?.pendingReports || 0, helper: `${stats?.verifiedReports || 0} verified`, icon: '🚨' },
    { label: 'Complaints', value: stats?.pendingComplaints || 0, helper: `${stats?.totalComplaints || 0} total`, icon: '📣' },
    { label: 'Proofs', value: stats?.pendingHygieneProofs || 0, helper: `${stats?.totalHygieneProofs || 0} total`, icon: '📸' },
    { label: 'Avg Hygiene', value: stats?.averageHygieneScore || 0, helper: `Trust ${stats?.averageTrustScore || 0}`, icon: '✨' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Admin Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gray-800">Platform overview</h1>
        <p className="mt-2 text-sm text-gray-500">Users, providers, reports, complaints aur hygiene proofs ka live snapshot.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{card.label}</span>
            </div>
            <div className="mt-4 font-display text-4xl font-bold text-gray-800">{card.value}</div>
            <p className="mt-2 text-sm text-gray-500">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-gray-800">All Providers</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{providers.length} total</span>
          </div>
          <div className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-sm text-gray-500">No providers found.</p>
            ) : (
              providers.map((provider) => (
                <div key={provider._id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{provider.name}</p>
                      <p className="text-xs text-gray-400">{provider.address?.city}, {provider.address?.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-500">₹{provider.pricePerMeal}/meal</p>
                      <p className="text-xs text-gray-400">Owner: {provider.ownerId?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-gray-800">All Users</h2>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">{users.length} total</span>
          </div>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user._id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="mt-1 text-xs text-gray-500">Role: {user.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
