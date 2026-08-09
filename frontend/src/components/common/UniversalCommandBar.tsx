import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, Terminal, Settings, ExternalLink, Sparkles, X, Layers } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'ASSET' | 'SERVICE' | 'CONFIG' | 'PAGE' | 'COMMAND';
  description: string;
  action: () => void;
  statusTag?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UniversalCommandBar = ({ isOpen, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commandItems: CommandItem[] = [
    // Pages & Core Access
    {
      id: 'access-center',
      title: 'Open Access Center Map',
      category: 'PAGE',
      description: 'Central system access map, dependency graph, & data flow lineage',
      action: () => { navigate('/access-center'); onClose(); },
    },
    {
      id: 'services-dir',
      title: 'Open System Services Directory',
      category: 'SERVICE',
      description: 'Inspect status, version, uptime, and latency of 12 platform components',
      action: () => { navigate('/services'); onClose(); },
    },
    {
      id: 'system-settings',
      title: 'Open System Control Settings',
      category: 'CONFIG',
      description: 'Manage telemetry interval, health model weights, and alert rules',
      action: () => { navigate('/settings'); onClose(); },
    },
    {
      id: 'security-posture',
      title: 'Open Security & Compliance Posture',
      category: 'CONFIG',
      description: 'Role-Based Access Control matrix, session security, and audit logs',
      action: () => { navigate('/security'); onClose(); },
    },

    // Asset Navigation
    {
      id: 'asset-motor-001',
      title: 'Open MOTOR-001 (3-Phase Induction Motor)',
      category: 'ASSET',
      description: 'Inspect live thermal/vibration telemetry and digital twin state',
      statusTag: 'SIMULATED',
      action: () => { navigate('/assets/MOTOR-001'); onClose(); },
    },
    {
      id: 'asset-laptop-001',
      title: 'Open LAPTOP-001 (Host Workstation)',
      category: 'ASSET',
      description: 'View real host hardware CPU, RAM, Disk, and temperature metrics',
      statusTag: 'REAL-TIME LOCAL',
      action: () => { navigate('/assets/LAPTOP-001'); onClose(); },
    },
    {
      id: 'asset-pump-001',
      title: 'Open PUMP-001 (Fluid Centrifugal Pump)',
      category: 'ASSET',
      description: 'Fluid dynamic physics simulation twin',
      statusTag: 'SIMULATED',
      action: () => { navigate('/assets/PUMP-001'); onClose(); },
    },

    // Commands & Action Triggers
    {
      id: 'cmd-diagnostics',
      title: 'Run System Diagnostics',
      category: 'COMMAND',
      description: 'Execute live latency and connectivity test across components',
      action: () => { navigate('/settings?tab=diagnostics'); onClose(); },
    },
    {
      id: 'cmd-incidents',
      title: 'Show Active Alerts & Incidents',
      category: 'COMMAND',
      description: 'View active warning/critical alerts and incident timeline',
      action: () => { navigate('/alerts'); onClose(); },
    },
    {
      id: 'cmd-copilot',
      title: 'Open IRISYN Copilot Console',
      category: 'COMMAND',
      description: 'Full-page data-first AI assistant command center',
      action: () => { navigate('/copilot'); onClose(); },
    },
  ];

  const filtered = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md p-4 md:p-12 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <Search size={20} className="text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search IRISYN resources or enter command (e.g. 'Open MOTOR-001', 'Run diagnostics')..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Command Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 font-sans">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No matching resources or commands found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    active ? 'bg-purple-600 text-white' : 'hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${active ? 'bg-purple-700 text-white' : 'bg-slate-800 text-purple-400'}`}>
                      {item.category === 'ASSET' && <Cpu size={16} />}
                      {item.category === 'SERVICE' && <Terminal size={16} />}
                      {item.category === 'CONFIG' && <Settings size={16} />}
                      {item.category === 'COMMAND' && <Sparkles size={16} />}
                      {item.category === 'PAGE' && <Layers size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        {item.title}
                        {item.statusTag && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            active ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.statusTag}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${active ? 'text-purple-100' : 'text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
                      active ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    <ExternalLink size={14} className={active ? 'text-white' : 'text-slate-500'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Shortcut Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-200">↑ ↓</strong> Navigate</span>
            <span><strong className="text-slate-200">Enter</strong> Select</span>
            <span><strong className="text-slate-200">Esc</strong> Close</span>
          </div>
          <span className="text-purple-400">IRISYN Universal Command Center</span>
        </div>
      </div>
    </div>
  );
};

export default UniversalCommandBar;
