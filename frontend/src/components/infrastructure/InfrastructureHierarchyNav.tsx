import { useNavigate, useLocation } from 'react-router-dom';
import { Server, Box, Layers, ChevronRight, Activity } from 'lucide-react';

const InfrastructureHierarchyNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const steps = [
    { path: '/servers', label: 'RACK & PHYSICAL NODE', sub: 'Physical Hardware', icon: Server },
    { path: '/virtual-machines', label: 'VIRTUAL MACHINE', sub: 'Hypervisor & VMs', icon: Box },
    { path: '/containers', label: 'CONTAINER / POD', sub: 'Workloads & Services', icon: Layers },
  ];

  return (
    <div className="bg-[#0D121A] border border-[#1E2936] rounded-2xl p-3 md:p-4 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-[#1E2936] pb-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-purple-400" />
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-300">
            INFRASTRUCTURE ARCHITECTURE HIERARCHY
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          CONNECTED MODEL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentPath === step.path;
          return (
            <div key={step.path} className="flex items-center gap-2">
              <button
                onClick={() => navigate(step.path)}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                  isActive
                    ? 'bg-purple-600/15 border-purple-500/60 shadow-lg shadow-purple-500/10'
                    : 'bg-[#111923] hover:bg-[#16212e] border-[#1E2936] hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-purple-400 group-hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold truncate ${
                        isActive ? 'text-purple-300' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{step.sub}</p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-slate-600">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfrastructureHierarchyNav;
