import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Cpu,
  Activity,
  Server,
  Boxes,
  Container as ContainerIcon,
  Brain,
  Wrench,
  AlertTriangle,
  Workflow,
  Layers,
  Database,
  ShieldCheck,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    title: 'CORE PLATFORM',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/copilot', label: 'AI Copilot', icon: Bot },
      { to: '/assets', label: 'Digital Twins (Assets)', icon: Cpu },
      { to: '/telemetry', label: 'Live Telemetry', icon: Activity },
    ],
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { to: '/servers', label: 'Servers & Racks', icon: Server },
      { to: '/virtual-machines', label: 'Virtual Machines', icon: Boxes },
      { to: '/containers', label: 'Containers & Pods', icon: ContainerIcon },
    ],
  },
  {
    title: 'AI & PREDICTIVE OPS',
    items: [
      { to: '/ai-insights', label: 'AI Insights & Predictions', icon: Brain },
      { to: '/maintenance', label: 'Predictive Maintenance', icon: Wrench },
      { to: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { to: '/alerts', label: 'Alerts & Incidents', icon: AlertTriangle },
      { to: '/automation', label: 'Remediation & Action', icon: Workflow },
    ],
  },
  {
    title: 'ARCHITECTURE & DATA',
    items: [
      { to: '/architecture', label: 'Target Architecture', icon: Layers },
      { to: '/data-sources', label: 'Data Sources & Quality', icon: Database },
      { to: '/security', label: 'Security & Access', icon: ShieldCheck },
      { to: '/settings', label: 'System Settings', icon: SettingsIcon },
    ],
  },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
        <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-9 w-9 object-contain shrink-0 filter drop-shadow-sm" />
        <div className="flex flex-col">
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300 tracking-wide leading-none">
            IRISYN
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
            SEE • PREDICT • ACT
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {group.title}
            </h4>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-l-2 border-purple-500'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
