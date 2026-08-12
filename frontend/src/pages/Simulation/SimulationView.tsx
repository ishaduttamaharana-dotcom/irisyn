import React, { useState } from 'react';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { PlayCircle, Pause, Zap, Gauge, AlertOctagon } from 'lucide-react';
import { setSimulationScenario, toggleSimulationPause, setSimulationSpeed } from '@/services/assets.service';

export const SimulationView: React.FC = () => {
  const [scenario, setScenarioState] = useState('NORMAL');
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleScenarioChange = async (name: string) => {
    setIsUpdating(true);
    await setSimulationScenario(name);
    setScenarioState(name);
    setIsUpdating(false);
  };

  const handlePauseToggle = async () => {
    setIsUpdating(true);
    const nextPaused = !isPaused;
    await toggleSimulationPause(nextPaused);
    setIsPaused(nextPaused);
    setIsUpdating(false);
  };

  const handleSpeedChange = async (multiplier: number) => {
    setIsUpdating(true);
    await setSimulationSpeed(multiplier);
    setSpeedState(multiplier);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-amber-400" />
              <span>Synthetic Industrial Simulation Control</span>
            </h2>
            <DataSourceBadge source="SIMULATED" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physics-driven simulation engine for synthetic industrial assets (MOTOR-001, PUMP-001).
          </p>
        </div>

        <button
          onClick={handlePauseToggle}
          disabled={isUpdating}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
            isPaused
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          {isPaused ? <PlayCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span>{isPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Scenario & Fault Injection</span>
          </h3>

          <div className="space-y-2">
            {[
              { id: 'NORMAL', label: 'Normal Operating Conditions', desc: 'Standard RPM, load, and thermal stability' },
              { id: 'HIGH_LOAD', label: 'High Load Stress', desc: 'Increased torque and current draw' },
              { id: 'THERMAL_OVERLOAD', label: 'Thermal Degradation', desc: 'Simulated cooling failure (+25°C)' },
              { id: 'BEARING_FAULT', label: 'Bearing Vibration Fault', desc: 'Vibration anomaly exceeding 4.5 mm/s' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                disabled={isUpdating}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  scenario === sc.id
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">{sc.label}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Multiplier */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Simulation Time Multiplier</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[1, 5, 10, 50].map((mult) => (
              <button
                key={mult}
                onClick={() => handleSpeedChange(mult)}
                disabled={isUpdating}
                className={`p-4 rounded-xl border text-center text-xs transition-all ${
                  speed === mult
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg font-bold block">{mult}x</span>
                <span className="text-[10px] text-slate-500 uppercase">Multiplier</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset State Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Active Simulated Assets</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">MOTOR-001</span>
                <span className="text-emerald-400">1480 RPM</span>
              </div>
              <p className="text-slate-400 text-[11px]">Siemens 150kW 3-Phase Industrial Motor</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">PUMP-001</span>
                <span className="text-emerald-400">2900 RPM</span>
              </div>
              <p className="text-slate-400 text-[11px]">Grundfos High-Pressure Centrifugal Pump</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
