import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/reports', label: 'Reports', icon: '🛡️' },
];

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-50/80">MessMate AI</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Admin Control</h2>
            <p className="mt-1 text-sm text-orange-50/90">{user?.name || 'Admin'}</p>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-orange-500'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
