import { useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Flame, Zap, Activity } from 'lucide-react';
import { setSimulationScenario, toggleSimulationPause, setSimulationSpeed } from '@/services/assets.service';

interface Props {
  onScenarioChange?: () => void;
}

const SimulationControlBar = ({ onScenarioChange }: Props) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState(1);
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [loading, setLoading] = useState(false);

  const handleTogglePause = async () => {
    setLoading(true);
    const next = !isPaused;
    await toggleSimulationPause(next);
    setIsPaused(next);
    setLoading(false);
    onScenarioChange?.();
  };

  const handleSpeedChange = async (speed: number) => {
    setLoading(true);
    await setSimulationSpeed(speed);
    setActiveSpeed(speed);
    setLoading(false);
    onScenarioChange?.();
  };

  const handleScenarioChange = async (scenario: string) => {
    setLoading(true);
    await setSimulationScenario(scenario);
    setActiveScenario(scenario);
    setLoading(false);
    onScenarioChange?.();
  };

  return (
    <div className="card p-4 bg-slate-900/90 border border-slate-800 text-slate-100 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs">
          <Activity size={14} className="animate-pulse" />
          SIMULATION CONTROL (DEMO MODE)
        </div>
        <span className="text-xs text-slate-400">
          Active Scenario: <strong className="text-amber-400">{activeScenario}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={handleTogglePause}
          disabled={loading}
          className="btn btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} className="text-amber-400" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          {[1, 5, 10, 50].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                activeSpeed === speed ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Fault Injection Buttons */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          <button
            onClick={() => handleScenarioChange('BEARING_DEGRADATION')}
            className={`text-xs py-1.5 px-2.5 rounded font-medium flex items-center gap-1 border ${
              activeScenario === 'BEARING_DEGRADATION'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle size={13} className="text-amber-400" />
            Bearing Fault
          </button>

          <button
            onClick={() => handleScenarioChange('THERMAL_STRESS')}
            className={`text-xs py-1.5 px-2.5 rounded font-medium flex items-center gap-1 border ${
              activeScenario === 'THERMAL_STRESS'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame size={13} className="text-rose-400" />
            Thermal Stress
          </button>

          <button
            onClick={() => handleScenarioChange('ELECTRICAL_ABNORMALITY')}
            className={`text-xs py-1.5 px-2.5 rounded font-medium flex items-center gap-1 border ${
              activeScenario === 'ELECTRICAL_ABNORMALITY'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap size={13} className="text-yellow-400" />
            Electrical Fault
          </button>

          <button
            onClick={() => handleScenarioChange('NORMAL')}
            className="text-xs py-1.5 px-2.5 rounded font-medium flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          >
            <RotateCcw size={13} />
            Reset Normal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControlBar;
