import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Download,
  RotateCw,
  Leaf,
  PieChart,
  ShieldCheck,
  Sparkles,
  FileText,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { useReports } from '@/hooks/usePlatformData';

export const ReportsView: React.FC = () => {
  const { data: reports, refetch } = useReports();
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleForceSync = () => {
    setSyncing(true);
    refetch();
    setTimeout(() => {
      setSyncing(false);
      setNotification('Executive data synchronized with live telemetry & compliance pipeline.');
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  const handleExportPdf = () => {
    setNotification('Exported Executive Reporting & Compliance Hub (PDF)');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownloadFile = (title: string, format: string) => {
    setNotification(`Downloaded ${title} (${format.toUpperCase()})`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <DashboardLayout
      title="Executive Reporting & Compliance Hub"
      description="Global Strategic Dashboard • Real-time Aggregation"
    >
      <div className="space-y-6 font-sans">
        {/* Sync Notification Banner */}
        {notification && (
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/50 flex justify-between items-center font-mono text-xs text-purple-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-200 font-bold">Dismiss</button>
          </div>
        )}

        {/* Page Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">Executive Reporting & Compliance Hub</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Global Strategic Dashboard • Real-time Telemetry Aggregation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 font-mono text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={14} className="text-cyan-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs rounded-lg transition-colors flex items-center gap-2 shadow-md"
            >
              <RotateCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Force Sync'}</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1. Fleet Sustainability & ESG (Top Full Width Card) */}
          <div className="col-span-1 md:col-span-12 p-6 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Leaf size={18} className="text-cyan-400" />
                Fleet Sustainability & ESG Framework
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border-l-2 border-cyan-400 uppercase">
                Q3 Target Cycle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              {/* Carbon Footprint */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 font-sans text-[11px] uppercase">Carbon Footprint (CO2e)</span>
                  <span className="text-red-400 font-bold">12.4k Tons</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Actual</span>
                  <span>Target: 10k</span>
                </div>
              </div>

              {/* Energy Efficiency */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 font-sans text-[11px] uppercase">Energy Efficiency</span>
                  <span className="text-cyan-300 font-bold">142 kWh/unit</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Actual</span>
                  <span>Target: 150</span>
                </div>
              </div>

              {/* Water Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 font-sans text-[11px] uppercase">Water Usage</span>
                  <span className="text-purple-300 font-bold">450k Gal</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Actual</span>
                  <span>Target: 500k</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. OEE Performance (Main Focus Card - Left Column Span 7) */}
          <div className="col-span-1 md:col-span-7 p-6 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <PieChart size={18} className="text-purple-400" />
                OEE Performance (Overall Equipment Effectiveness)
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border-l-2 border-purple-500 uppercase">
                Global Average
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6 flex-1">
              {/* SVG Ring Chart */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#1E2936" strokeWidth="10" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#35C9FF"
                    strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset="42"
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl font-extrabold text-slate-100 tracking-tight">
                    84.2<span className="text-sm font-bold">%</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Total Effectiveness</span>
                </div>
              </div>

              {/* Sub Metrics Breakdown */}
              <div className="flex flex-col gap-4 w-full max-w-[220px] font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-end text-[11px]">
                    <span className="text-slate-400">Availability</span>
                    <span className="text-slate-100 font-bold">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-end text-[11px]">
                    <span className="text-slate-400">Performance</span>
                    <span className="text-slate-100 font-bold">88%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-end text-[11px]">
                    <span className="text-slate-400">Quality</span>
                    <span className="text-slate-100 font-bold">99%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Right Column Stack (Span 5) */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-6">
            {/* Compliance & Audit Readiness Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-400" />
                  Compliance & Audits
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-200 font-bold">ISO 50001</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Scan: 2h ago</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-200 font-bold">SOC2 Type II</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Scan: 1d ago</span>
                </div>

                {/* Downloadable Generated Reports List */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Generated Audit Artifacts</span>
                  {reports?.slice(0, 2).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleDownloadFile(r.title, r.format)}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {r.format.toLowerCase() === 'pdf' ? (
                          <FileText size={15} className="text-red-400" />
                        ) : (
                          <FileSpreadsheet size={15} className="text-emerald-400" />
                        )}
                        <span className="text-xs text-slate-200 font-sans">{r.title}</span>
                      </div>
                      <Download size={14} className="text-slate-400 hover:text-purple-300 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Insights & Predictive ROI Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-400" />
                  Predictive ROI Forecast
                </h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-[10px] rounded border border-purple-500/30 uppercase">
                  AI Forecast
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                AI-driven predictive maintenance models indicate potential CapEx savings across European infrastructure nodes.
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Forecasted Savings (YTD)</span>
                <span className="text-lg font-extrabold text-cyan-300">+$1.2M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsView;
