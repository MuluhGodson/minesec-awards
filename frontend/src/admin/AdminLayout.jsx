import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Award, BookOpen, LogOut, Briefcase, Users } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/editions', label: 'Editions', icon: Award },
    { path: '/admin/categories', label: 'Categories', icon: BookOpen },
    { path: '/admin/recipient-types', label: 'Target Audiences', icon: Users },
    { path: '/admin/sponsors', label: 'Sponsors', icon: Briefcase }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#020b08] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#010604] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
              <img src="/favicon.png" alt="MINESEC Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold tracking-wide">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  active 
                    ? 'bg-[var(--color-minesec-gold)]/10 text-[var(--color-minesec-gold)] border border-[var(--color-minesec-gold)]/30' 
                    : 'text-[var(--color-minesec-text-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold">{user.name || 'Admin'}</span>
              <span className="text-xs text-[var(--color-minesec-text-muted)] uppercase tracking-wider font-mono">{user.role || 'Super User'}</span>
            </div>
            <button onClick={handleLogout} className="text-[var(--color-minesec-text-muted)] hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-white/5 flex items-center px-8 bg-[#010604]">
          <h1 className="text-lg font-bold">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
