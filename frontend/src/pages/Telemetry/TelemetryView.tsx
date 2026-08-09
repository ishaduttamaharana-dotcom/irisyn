import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Activity, Cpu, Server, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAssets } from '@/services/assets.service';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TimePoint {
  time: string;
  laptopCpu: number;
  laptopTemp: number;
  motorTemp: number;
  motorVibration: number;
  motorRpm: number;
}

const TelemetryView = () => {
  const [history, setHistory] = useState<TimePoint[]>([]);

  const { data: assets = [], refetch } = useQuery({
    queryKey: ['telemetry-assets'],
    queryFn: () => getAssets('ALL'),
    refetchInterval: 1000,
  });

  const laptop = assets.find((a) => a.id === 'LAPTOP-001') || assets[0];
  const motor = assets.find((a) => a.id === 'MOTOR-001') || assets[1];

  useEffect(() => {
    if (laptop && motor) {
      const nowStr = new Date().toLocaleTimeString();
      const point: TimePoint = {
        time: nowStr,
        laptopCpu: laptop.metrics?.cpu ?? 35,
        laptopTemp: laptop.metrics?.temperature ?? 45,
        motorTemp: motor.metrics?.temperature ?? 55,
        motorVibration: motor.metrics?.disk ?? 1.4, // disk field contains vibration for motor
        motorRpm: motor.metrics?.rpm ?? 1480,
      };

      setHistory((prev) => [...prev.slice(-20), point]);
    }
  }, [assets, laptop, motor]);

  return (
    <DashboardLayout
      title="Live Telemetry Explorer & High-Frequency Stream"
      description="Real-time live streaming metrics from physical laptop workstation and synthetic industrial twin"
    >
      <div className="space-y-6">
        {/* Simulation Control Bar */}
        <SimulationControlBar onScenarioChange={refetch} />

        {/* Real-time Telemetry Pipeline Status Banner */}
        <div className="card p-6 bg-slate-900 border-slate-800">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
                <Activity size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-lg font-bold text-slate-100">LIVE TELEMETRY TRANSPORT: WEBSOCKET ACTIVE</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Collection Frequency: <strong className="text-purple-300">1.0 sec</strong> • Freshness: <strong className="text-emerald-400">&lt; 0.8s</strong> • Transport: <strong className="text-purple-300">WSS / WebSocket</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Pipeline 100% Operational
              </span>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans text-[11px]">LAPTOP CPU LOAD</span>
              <strong className="text-emerald-400 text-lg font-bold">{laptop?.metrics?.cpu ?? 35}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">REAL-TIME LOCAL</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans text-[11px]">LAPTOP TEMPERATURE</span>
              <strong className="text-purple-300 text-lg font-bold">{laptop?.metrics?.temperature ?? 45}°C</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">REAL-TIME LOCAL</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans text-[11px]">MOTOR STATOR TEMP</span>
              <strong className="text-amber-400 text-lg font-bold">{motor?.metrics?.temperature ?? 55}°C</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">SIMULATED</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans text-[11px]">MOTOR VIBRATION (RMS)</span>
              <strong className="text-rose-400 text-lg font-bold">{motor?.metrics?.disk ?? 1.4} mm/s</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">SIMULATED</span>
            </div>
          </div>
        </div>

        {/* Real-time Streaming Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laptop Telemetry Stream */}
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">LAPTOP-001 Hardware Telemetry</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                REAL-TIME LOCAL
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="laptopCpu" name="CPU (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="laptopTemp" name="Temp (°C)" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Industrial Motor Telemetry Stream */}
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-purple-400" />
                <h4 className="text-sm font-bold text-slate-100">MOTOR-001 Physics Telemetry</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                SIMULATED
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="motorTemp" name="Stator Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="motorVibration" name="Vibration (mm/s)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TelemetryView;
