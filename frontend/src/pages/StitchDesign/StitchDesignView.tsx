import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

export const StitchDesignView: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenStandalone = () => {
    window.open('/design.html', '_blank');
  };

  return (
    <DashboardLayout
      title="Stitch Design Studio (15112896591399027842)"
      description="SEE • PREDICT • ACT — High-Fidelity IRISYN Operations & Digital Twin Multi-View Design Suite"
    >
      <div className="space-y-4">
        {/* Top Action & Status Bar */}
        <div className="card p-4 bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Stitch Design Suite: Project #15112896591399027842
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  FULL SUITE CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected 12 Operations, Engineering Investigation (MOTOR-001), Physics Simulation, Data Integrations & WebGL Shader views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <RefreshCw size={14} />
              <span>Refresh Canvas</span>
            </button>

            <button
              onClick={handleOpenStandalone}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
            >
              <ExternalLink size={14} />
              <span>Open Fullscreen (/design.html)</span>
            </button>
          </div>
        </div>

        {/* Embedded Standalone Design Canvas Frame */}
        <div className="card p-0 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[750px] flex flex-col">
          <iframe
            key={iframeKey}
            src="/design.html"
            title="IRISYN Stitch Design Canvas"
            className="w-full h-[750px] border-0 block"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StitchDesignView;
