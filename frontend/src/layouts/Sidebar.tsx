import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Network,
  Boxes,
  Container as ContainerIcon,
  Brain,
  Workflow,
  ShieldCheck,
  GitBranch,
  Settings as SettingsIcon,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/servers', label: 'Servers', icon: Server },
  { to: '/infrastructure', label: 'Infrastructure', icon: Network },
  { to: '/virtual-machines', label: 'Virtual Machines', icon: Boxes },
  { to: '/containers', label: 'Containers', icon: ContainerIcon },
  { to: '/ai-insights', label: 'AI Insights', icon: Brain },
  { to: '/automation', label: 'Automation', icon: Workflow },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/cluster', label: 'Cluster', icon: GitBranch },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
        <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-9 w-9 object-contain shrink-0 filter drop-shadow-sm" />
        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300 tracking-wide">
          IRISYN
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-100'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
