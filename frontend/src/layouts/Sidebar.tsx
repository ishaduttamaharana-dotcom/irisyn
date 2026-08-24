import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Cpu,
  Activity,
  Box,
  Wrench,
  AlertTriangle,
  Sliders,
  Link2,
  Stethoscope,
  ListOrdered,
  FilePieChart,
  Compass,
  PlayCircle,
  Clock,
  Server,
  Boxes,
  Container as ContainerIcon,
  Brain,
  Database
} from 'lucide-react';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    title: 'CORE PLATFORM',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/stitch-design', label: 'Stitch Design Suite', icon: LayoutDashboard },
      { to: '/access-center', label: 'Access Center', icon: Compass },
      { to: '/copilot', label: 'AI Copilot', icon: Bot },
      { to: '/telemetry', label: 'Live Telemetry', icon: Activity },
    ],
  },
  {
    title: 'DIGITAL TWINS',
    items: [
      { to: '/assets', label: 'All Assets', icon: Cpu },
      { to: '/digital-twin', label: 'Digital Twin (3D View)', icon: Box },
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
    title: 'AI & ANALYTICS',
    items: [
      { to: '/ai-insights', label: 'AI Insights', icon: Brain },
      { to: '/predictions', label: 'Predictions & Anomalies', icon: Sliders },
      { to: '/simulation', label: 'Simulation Engine', icon: PlayCircle },
    ],
  },
  {
    title: 'MAINTENANCE & OPERATIONS',
    items: [
      { to: '/maintenance', label: 'Maintenance Schedule', icon: Wrench },
      { to: '/alerts', label: 'Alerts & Automation', icon: AlertTriangle },
      { to: '/incidents', label: 'Incidents', icon: Clock },
      { to: '/reports', label: 'Reports', icon: FilePieChart },
    ],
  },
  {
    title: 'DATA & INTEGRATION',
    items: [
      { to: '/data-sources', label: 'Data Sources & Quality', icon: Database },
      { to: '/integrations', label: 'Connectors & APIs', icon: Link2 },
      { to: '/industrial', label: 'Industrial Edge & AI', icon: Cpu },
      { to: '/logs', label: 'System Logs', icon: ListOrdered },
      { to: '/diagnostics', label: 'Diagnostics', icon: Stethoscope },
    ],
  },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r border-slate-800 bg-slate-900">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950">
        <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-9 w-9 object-contain shrink-0 filter drop-shadow-sm" />
        <div className="flex flex-col">
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 tracking-wide leading-none">
            IRISYN
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            DIGITAL TWIN PLATFORM
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {group.title}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-purple-600/15 text-purple-300 font-bold border border-purple-500/20 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    )
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
