import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Server,
  Workflow,
  Settings,
  Layers,
  FileText,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';

const UserProfileMenu = () => {
  const { user, switchRole, logout, login } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const roles: { role: UserRole; label: string; color: string }[] = [
    { role: 'ADMIN', label: 'Administrator', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { role: 'ENGINEER', label: 'Systems Engineer', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { role: 'OPERATOR', label: 'Operations Tech', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { role: 'VIEWER', label: 'Observer / Read-Only', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  ];

  const adminNavItems = [
    { label: 'Security & RBAC', to: '/security', icon: ShieldCheck, color: 'text-purple-400' },
    { label: 'Deployment & Reliability', to: '/deployment', icon: Server, color: 'text-indigo-400' },
    { label: 'Cluster Info', to: '/services', icon: Workflow, color: 'text-blue-400' },
    { label: 'System Settings', to: '/settings', icon: Settings, color: 'text-amber-400' },
    { label: 'Target Architecture', to: '/architecture', icon: Layers, color: 'text-emerald-400' },
    { label: 'Security Audit Logs', to: '/security?tab=audit', icon: FileText, color: 'text-slate-400' },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
  };

  const handleResetUser = () => {
    login({
      id: 'u-1',
      name: 'Isha',
      email: 'isha@irisyn.local',
      role: 'ADMIN',
      lastLogin: 'Just now',
    });
    setIsOpen(false);
  };

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'IS';

  return (
    <div className="relative" ref={menuRef}>
      {/* Interactive Profile Badge Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        title="Open User Profile & Administration Settings"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-xs font-extrabold shadow-sm group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        <div className="hidden sm:block text-left text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {user?.name ?? 'Isha'}
          </p>
          <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold tracking-wider">
            {user?.role ?? 'ADMIN'}
          </p>
        </div>

        <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100 divide-y divide-slate-800/80">
          
          {/* User Profile Card */}
          <div className="p-4 bg-slate-950/80 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-md shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-100 truncate">{user?.name ?? 'Isha'}</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user?.role ?? 'ADMIN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email ?? 'isha@irisyn.local'}</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active Session • Authorized
              </p>
            </div>
          </div>

          {/* Role Switcher Section */}
          <div className="p-3 bg-slate-900/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield size={12} className="text-purple-400" /> Switch Active Role
              </span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">RBAC Live</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {roles.map((r) => {
                const isActive = user?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleRoleChange(r.role)}
                    className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-750'
                    }`}
                  >
                    <span className="truncate">{r.role}</span>
                    {isActive && <Check size={12} className="shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Administration Menu Section */}
          <div className="p-2 space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Administration
            </div>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); setIsOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors text-left"
                >
                  <Icon size={14} className={item.color} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Session Footer Actions */}
          <div className="p-2 bg-slate-950 flex items-center justify-between gap-2">
            <button
              onClick={handleResetUser}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Reset profile back to default Isha (ADMIN)"
            >
              <Sparkles size={12} className="text-purple-400" /> Reset Profile
            </button>

            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
